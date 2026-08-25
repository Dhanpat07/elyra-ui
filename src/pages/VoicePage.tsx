import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2, Zap, Clock, BarChart2 } from 'lucide-react'
import { AudioViz }       from '../components/AudioViz'
import { VoiceStateBadge } from '../components/VoiceStateBadge'
import { RouteBadge }     from '../components/RouteBadge'
import { LogPanel }       from '../components/LogPanel'
import { useStore }       from '../store'
import { useAuth }        from '../hooks/useAuth'
import { fetchVoices, fetchPersonas, voiceLogin, BRIDGE_WS } from '../api'
import { formatMs }       from '../lib'
import type { RAGRoute }  from '../store'

const WORKLET = `
class ResamplerProcessor extends AudioWorkletProcessor {
  constructor(o) {
    super();
    this.ratio = o.processorOptions.inputRate / 16000;
    this.buf = []; this.rp = 0; this.out = [];
  }
  process(inputs) {
    const inp = inputs[0][0]; if (!inp) return true;
    for (let i = 0; i < inp.length; i++) this.buf.push(inp[i]);
    while (this.rp < this.buf.length - 1) {
      const i0 = Math.floor(this.rp), f = this.rp - i0;
      this.out.push(this.buf[i0] * (1-f) + this.buf[i0+1] * f);
      this.rp += this.ratio;
    }
    const keep = this.buf.length - Math.floor(this.rp);
    this.buf = this.buf.slice(this.buf.length - keep);
    this.rp -= Math.floor(this.rp);
    if (this.out.length >= 800) {
      const i16 = new Int16Array(this.out.length);
      for (let k = 0; k < this.out.length; k++)
        i16[k] = Math.max(-32768, Math.min(32767, this.out[k] * 32768));
      this.port.postMessage(i16.buffer, [i16.buffer]);
      this.out = [];
    }
    return true;
  }
}
registerProcessor('resampler-processor', ResamplerProcessor);
`

interface Turn {
  id:          string
  you:         string
  agent:       string
  ragInjected: boolean
  ragRoute:    RAGRoute
  ragMs:       number
  ts:          number
}

export function VoicePage() {
  const {
    voiceState, setVoiceState, transcript, setTranscript,
    agentResponse, setAgentResponse, isConnected, setIsConnected,
    isMicOn, setIsMicOn
  } = useStore()

  const { profile } = useAuth()

  const [voices,       setVoices]       = useState<{ id: string; name: string; lang: string }[]>([])
  const [personas,     setPersonas]     = useState<{ id: string; name: string; role: string }[]>([])
  const [voiceId,      setVoiceId]      = useState('')
  const [persona,      setPersona]      = useState('aria')
  const [analyser,     setAnalyser]     = useState<AnalyserNode | null>(null)
  const [turns,        setTurns]        = useState<Turn[]>([])
  const [ragActive,    setRagActive]    = useState(false)
  const [sessionStats, setSessionStats] = useState({ turns: 0, avgMs: 0, ragHits: 0 })
  const [localLogs,    setLocalLogs]    = useState<{ id: string; level: 'info'|'warn'|'error'|'success'; message: string; source: string; timestamp: number }[]>([])

  function addLocalLog(level: 'info'|'warn'|'error'|'success', message: string, source: string) {
    setLocalLogs(prev => [{ id: crypto.randomUUID(), level, message, source, timestamp: Date.now() }, ...prev].slice(0, 100))
  }

  const wsRef       = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const workletRef  = useRef<AudioWorkletNode | null>(null)
  const pCtxRef     = useRef<AudioContext | null>(null)
  const pNextRef    = useRef(0)
  const currentTurn = useRef<Partial<Turn>>({})

  useEffect(() => {
    fetchVoices().then(setVoices).catch(() => {})
    fetchPersonas().then(setPersonas).catch(() => {})
  }, [])

  async function connect() {
    // Get JWT token from voice agent using Supabase profile
    let token = ''
    try {
      const userId   = profile?.id          || 'guest'
      const tenantId = profile?.tenant_id   || 'demo'
      const name     = profile?.name      || ''
      const email    = profile?.email     || ''
      const r = await voiceLogin(userId, tenantId, name, email)
      token = r.token
      addLocalLog('success', `Auth token obtained for ${userId}`, 'auth')
    } catch {
      addLocalLog('warn', 'Auth failed — connecting as guest', 'auth')
    }

    const url = `${BRIDGE_WS}?persona=${persona}${token ? `&token=${token}` : ''}`
    const ws  = new WebSocket(url)
    ws.binaryType = 'arraybuffer'
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      addLocalLog('success', 'Connected to Voice-RAG Bridge :8002', 'ws')
      if (voiceId) ws.send(JSON.stringify({ type: 'set_voice', voice_id: voiceId }))
    }

    ws.onclose = () => {
      setIsConnected(false)
      setVoiceState('IDLE')
      setRagActive(false)
      addLocalLog('warn', 'Disconnected from bridge', 'ws')
      stopMic()
    }

    ws.onerror = () => addLocalLog('error', 'WebSocket error', 'ws')

    ws.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) { playPCM(e.data); return }
      try {
        const m = JSON.parse(e.data)

        if (m.type === 'ready') {
          addLocalLog('success', `Pipeline ready — ${m.msg}`, 'agent')
        }

        if (m.type === 'state') {
          setVoiceState(m.state)
        }

        if (m.type === 'interrupt') {
          stopPlayback()
          addLocalLog('warn', 'Barge-in detected — audio stopped', 'agent')
        }

        if (m.type === 'transcript') {
          setTranscript(m.text)
          if (m.final) {
            currentTurn.current = { id: crypto.randomUUID(), you: m.text, ts: Date.now(), ragInjected: false, ragRoute: 'none', ragMs: 0 }
            addLocalLog('info', `You: ${m.text}`, 'stt')
          }
        }

        if (m.rag_injected) {
          setRagActive(true)
          currentTurn.current.ragInjected = true
          currentTurn.current.ragRoute    = (m.rag_route as RAGRoute) || 'bm25'
          currentTurn.current.ragMs       = m.rag_ms || 0
          addLocalLog('success', `RAG injected [${m.rag_route || 'bm25'}] ${m.rag_ms || 0}ms`, 'rag')
          setTimeout(() => setRagActive(false), 2000)
        }

        if (m.type === 'response') {
          setAgentResponse(m.text)
          addLocalLog('success', `Agent: ${m.text.slice(0, 80)}`, 'llm')

          if (currentTurn.current.you) {
            const turn: Turn = {
              id:          currentTurn.current.id || crypto.randomUUID(),
              you:         currentTurn.current.you || '',
              agent:       m.text,
              ragInjected: currentTurn.current.ragInjected || false,
              ragRoute:    currentTurn.current.ragRoute    || 'none',
              ragMs:       currentTurn.current.ragMs       || 0,
              ts:          currentTurn.current.ts          || Date.now(),
            }
            setTurns(prev => [turn, ...prev].slice(0, 20))
            setSessionStats(prev => ({
              turns:   prev.turns + 1,
              avgMs:   prev.avgMs,
              ragHits: prev.ragHits + (turn.ragInjected ? 1 : 0),
            }))
            currentTurn.current = {}
          }
        }

        if (m.type === 'metrics') {
          setSessionStats(prev => ({ ...prev, avgMs: m.avg_e2e_ms || prev.avgMs }))
        }

        if (m.type === 'voice_set') {
          addLocalLog('info', 'Voice applied', 'agent')
        }
      } catch {}
    }
  }

  function disconnect() {
    wsRef.current?.close()
    stopMic()
  }

  async function startMic() {
    if (!navigator.mediaDevices) {
      addLocalLog('error', 'Open via http://localhost:5173 (not 127.0.0.1)', 'mic')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      await ctx.resume()

      const blob = new Blob([WORKLET], { type: 'application/javascript' })
      const burl = URL.createObjectURL(blob)
      await ctx.audioWorklet.addModule(burl)
      URL.revokeObjectURL(burl)

      const src  = ctx.createMediaStreamSource(stream)
      const an   = ctx.createAnalyser(); an.fftSize = 256
      const node = new AudioWorkletNode(ctx, 'resampler-processor', {
        processorOptions: { inputRate: ctx.sampleRate }
      })
      node.port.onmessage = (ev) => {
        if (wsRef.current?.readyState === 1) wsRef.current.send(ev.data)
      }
      src.connect(an)
      src.connect(node)
      workletRef.current = node
      setAnalyser(an)
      setIsMicOn(true)
      addLocalLog('success', `Mic on @ ${ctx.sampleRate}Hz → resampled to 16kHz`, 'mic')
    } catch (err: any) {
      addLocalLog('error', `Mic error: ${err.message}`, 'mic')
    }
  }

  function stopMic() {
    workletRef.current?.disconnect()
    audioCtxRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    workletRef.current = null
    audioCtxRef.current = null
    streamRef.current   = null
    setAnalyser(null)
    setIsMicOn(false)
  }

  function playPCM(buf: ArrayBuffer) {
    if (!pCtxRef.current) {
      pCtxRef.current  = new AudioContext({ sampleRate: 24000 })
      pNextRef.current = 0
    }
    const ctx = pCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    const i16 = new Int16Array(buf)
    const f32 = new Float32Array(i16.length)
    for (let k = 0; k < i16.length; k++) f32[k] = i16[k] / 32768
    const ab  = ctx.createBuffer(1, f32.length, 24000)
    ab.copyToChannel(f32, 0)
    const src = ctx.createBufferSource()
    src.buffer = ab
    src.connect(ctx.destination)
    const now = ctx.currentTime
    if (pNextRef.current < now - 0.2) pNextRef.current = now
    src.start(pNextRef.current)
    pNextRef.current += ab.duration
  }

  function stopPlayback() {
    if (pCtxRef.current) { pCtxRef.current.close(); pCtxRef.current = null; pNextRef.current = 0 }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

      {/* ── LEFT: Controls ── */}
      <div className="space-y-4">

        {/* Connection card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white">Voice Agent</p>
            <VoiceStateBadge state={voiceState} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Persona</label>
            <select value={persona} onChange={e => setPersona(e.target.value)} className="input-field">
              {personas.length === 0 && <option value="aria">aria — default</option>}
              {personas.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Voice</label>
            <select value={voiceId} onChange={e => setVoiceId(e.target.value)} className="input-field">
              <option value="">Default voice</option>
              {voices.filter(v => v.lang === 'en').map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {!isConnected ? (
              <button onClick={connect} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <PhoneCall size={14} /> Connect
              </button>
            ) : (
              <button onClick={disconnect} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-semibold transition-all active:scale-95">
                <PhoneOff size={14} /> Disconnect
              </button>
            )}
            {isConnected && !isMicOn && (
              <button onClick={startMic} className="btn-primary flex items-center gap-2">
                <Mic size={14} /> Mic
              </button>
            )}
            {isMicOn && (
              <button onClick={stopMic} className="btn-ghost flex items-center gap-2">
                <MicOff size={14} /> Stop
              </button>
            )}
          </div>

          {/* RAG active indicator */}
          <AnimatePresence>
            {ragActive && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <Zap size={12} className="text-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">RAG data injected into context</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Session stats */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart2 size={11} /> Session Stats
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Turns',    value: sessionStats.turns },
              { label: 'Avg E2E',  value: sessionStats.avgMs ? formatMs(sessionStats.avgMs) : '—' },
              { label: 'RAG Hits', value: sessionStats.ragHits },
            ].map(s => (
              <div key={s.label} className="bg-surface-950 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Logs */}
        <LogPanel
          logs={localLogs}
          onClear={() => setLocalLogs([])}
          maxHeight="200px"
        />
      </div>

      {/* ── RIGHT: Audio + Conversation ── */}
      <div className="xl:col-span-2 space-y-4">

        {/* Audio visualizer */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 size={13} className="text-slate-500" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Audio Input</p>
            {isMicOn && <span className="ml-auto text-[10px] text-emerald-400 animate-pulse">● Live</span>}
          </div>
          <AudioViz analyser={analyser} active={isMicOn} />
        </div>

        {/* Live transcript */}
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Live Transcript</p>
          <p className={transcript ? 'text-white text-sm leading-relaxed min-h-[1.5rem]' : 'text-slate-600 text-sm italic min-h-[1.5rem]'}>
            {transcript || 'Waiting for speech…'}
          </p>
        </div>

        {/* Agent response */}
        <div className="card border border-emerald-500/10">
          <p className="text-xs text-emerald-500/60 uppercase tracking-wider mb-2">Agent Response</p>
          <p className={agentResponse ? 'text-emerald-300 text-sm leading-relaxed min-h-[1.5rem]' : 'text-slate-600 text-sm italic min-h-[1.5rem]'}>
            {agentResponse || 'Agent will respond here…'}
          </p>
        </div>

        {/* Conversation history */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={11} /> Conversation History
            </p>
            {turns.length > 0 && (
              <button onClick={() => setTurns([])} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                Clear
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {turns.length === 0 && (
              <p className="text-slate-600 text-xs text-center py-6">No conversation yet — connect and speak</p>
            )}
            <AnimatePresence initial={false}>
              {turns.map(turn => (
                <motion.div
                  key={turn.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-brand-600/20 border border-brand-500/20 rounded-2xl rounded-tr-sm px-3 py-2">
                      <p className="text-sm text-white">{turn.you}</p>
                    </div>
                  </div>
                  {/* Agent bubble */}
                  <div className="flex justify-start gap-2">
                    <div className="max-w-[80%] bg-surface-950 border border-white/[0.06] rounded-2xl rounded-tl-sm px-3 py-2">
                      <p className="text-sm text-slate-200">{turn.agent}</p>
                      {turn.ragInjected && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <RouteBadge route={turn.ragRoute} />
                          <span className="text-[10px] text-slate-500">{turn.ragMs}ms</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
