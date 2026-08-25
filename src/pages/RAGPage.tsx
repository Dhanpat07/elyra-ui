import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Upload, Database, RefreshCw, Loader2, List } from 'lucide-react'
import { RouteBadge } from '../components/RouteBadge'
import { useStore }  from '../store'
import { useAuth }   from '../hooks/useAuth'
import { ragQuery, fetchQAPairs, fetchQueryLogs, triggerIngest, pollIngestStatus, uploadFile } from '../api'
import { formatMs, formatTime } from '../lib'
import type { RAGRoute } from '../store'

const AGENTS = ['explorer','qgen','checker','selector','sql','exec','analyst','judge'] as const
const AGENT_LABELS: Record<string, string> = {
  explorer:'🔍 Explorer', qgen:'💭 Q.Gen', checker:'✅ Checker', selector:'🎯 Selector',
  sql:'✍️ SQL', exec:'⚡ Executor', analyst:'📊 Analyst', judge:'⚖️ Judge'
}

export function RAGPage() {
  const { tenantId, setTenantId, qaPairs, setQAPairs, ingestStatus, ingestPct, ingestStage, setIngest, addLog } = useStore()
  const { profile } = useAuth()

  const [question, setQuestion]   = useState('')
  const [answer, setAnswer]       = useState<{ text: string; route: RAGRoute; ms: number; score?: number; sql?: string } | null>(null)
  const [asking, setAsking]       = useState(false)
  const [agentStates, setAgentStates] = useState<Record<string, 'idle'|'running'|'done'>>({})
  const [ingestLog, setIngestLog] = useState<{ level: string; msg: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [dbForm, setDbForm]       = useState({ host: '', port: '8080', user: 'admin', password: '', catalog: '', schema: '' })
  const [dbType, setDbType]       = useState('trino')
  const [queryLogs, setQueryLogs] = useState<{ id: string; question: string; answer: string; route: string; latency_ms: number; score: number | null; created_at: string }[]>([])
  const [activeTab, setActiveTab] = useState<'qa' | 'logs'>('qa')
  const fileRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync tenant from profile
  useEffect(() => {
    if (profile?.tenant_id) setTenantId(profile.tenant_id)
  }, [profile])

  // Auto-load QA pairs on mount
  useEffect(() => {
    if (tenantId) { loadQA(); loadLogs() }
  }, [tenantId])

  async function ask() {
    if (!question.trim()) return
    setAsking(true)
    setAnswer(null)
    try {
      const r = await ragQuery(tenantId, question)
      setAnswer({ text: r.answer, route: r.route as RAGRoute, ms: r.ms, score: r.score })
      addLog({ level: 'success', message: `RAG: ${r.answer.slice(0, 80)}`, source: 'rag' })
    } catch (e: any) {
      setAnswer({ text: `Error: ${e.message}`, route: 'error', ms: 0 })
    } finally {
      setAsking(false)
    }
  }

  async function loadQA() {
    try {
      const r = await fetchQAPairs(tenantId)
      setQAPairs(r.qa_pairs)
    } catch {}
  }

  async function loadLogs() {
    try {
      const r = await fetchQueryLogs(tenantId)
      setQueryLogs(r.logs)
    } catch {}
  }

  async function startIngest() {
    setIngest({ status: 'running', pct: 2, stage: 'Connecting…' })
    setAgentStates({})
    setIngestLog([])
    try {
      await triggerIngest({
        tenant_id: tenantId, db_type: dbType,
        host: dbForm.host, port: parseInt(dbForm.port) || 8080,
        user: dbForm.user, password: dbForm.password || null,
        catalog: dbForm.catalog || null, schema: dbForm.schema || null,
      })
      let since = 0
      pollRef.current = setInterval(async () => {
        try {
          const s = await pollIngestStatus(tenantId, since)
          setIngest({ status: s.status as any, pct: s.pct, stage: s.stage })
          if (s.log.length) {
            since = Date.now()
            setIngestLog(prev => [...prev, ...s.log].slice(-100))
          }
          // update agent states based on stage
          const stageAgentMap: Record<string, string> = {
            explorer:'explorer', qgen:'qgen', checker:'checker', selector:'selector',
            sql:'sql', exec:'exec', analyst:'analyst', judge:'judge'
          }
          if (stageAgentMap[s.stage]) {
            setAgentStates(prev => ({ ...prev, [stageAgentMap[s.stage]]: 'running' }))
          }
          if (s.status === 'done' || s.status === 'error') {
            clearInterval(pollRef.current!)
            if (s.status === 'done') {
              AGENTS.forEach(a => setAgentStates(prev => ({ ...prev, [a]: 'done' })))
              setTimeout(loadQA, 1000)
            }
          }
        } catch {}
      }, 3000)
    } catch (e: any) {
      setIngest({ status: 'error', stage: e.message })
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadFile(tenantId, file)
      addLog({ level: 'success', message: `Uploaded: ${file.name}`, source: 'upload' })
      setTimeout(loadQA, 2000)
    } catch (err: any) {
      addLog({ level: 'error', message: `Upload failed: ${err.message}`, source: 'upload' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: Connect + Ingest */}
      <div className="space-y-4">
        {/* Tenant */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card space-y-3">
          <p className="font-semibold text-white text-sm">Tenant</p>
          <input className="input-field" value={tenantId} onChange={e => setTenantId(e.target.value)} placeholder="demo" />
        </motion.div>

        {/* DB Connect */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="card space-y-3">
          <p className="font-semibold text-white text-sm flex items-center gap-2"><Database size={14} /> Connect Database</p>
          <select className="input-field" value={dbType} onChange={e => setDbType(e.target.value)}>
            {['trino','postgresql','mysql','mssql','snowflake','bigquery','duckdb'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input className="input-field" placeholder="Host" value={dbForm.host} onChange={e => setDbForm(p => ({ ...p, host: e.target.value }))} />
            <input className="input-field" placeholder="Port" value={dbForm.port} onChange={e => setDbForm(p => ({ ...p, port: e.target.value }))} />
            <input className="input-field" placeholder="User" value={dbForm.user} onChange={e => setDbForm(p => ({ ...p, user: e.target.value }))} />
            <input className="input-field" placeholder="Password" type="password" value={dbForm.password} onChange={e => setDbForm(p => ({ ...p, password: e.target.value }))} />
            <input className="input-field" placeholder="Catalog" value={dbForm.catalog} onChange={e => setDbForm(p => ({ ...p, catalog: e.target.value }))} />
            <input className="input-field" placeholder="Schema" value={dbForm.schema} onChange={e => setDbForm(p => ({ ...p, schema: e.target.value }))} />
          </div>
          <button onClick={startIngest} disabled={ingestStatus === 'running'} className="btn-primary w-full flex items-center justify-center gap-2">
            {ingestStatus === 'running' ? <><Loader2 size={14} className="animate-spin" /> Running…</> : '🚀 Connect & Pre-Generate'}
          </button>

          {/* Progress */}
          <AnimatePresence>
            {ingestStatus !== 'idle' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{ingestStage}</span>
                  <span>{ingestPct}%</span>
                </div>
                <div className="h-1.5 bg-surface-950 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full"
                    animate={{ width: `${ingestPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                {/* Agents */}
                <div className="grid grid-cols-4 gap-1">
                  {AGENTS.map(a => (
                    <div key={a} className={`text-center p-1.5 rounded-lg text-[10px] border transition-all ${
                      agentStates[a] === 'done'    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                      agentStates[a] === 'running' ? 'border-brand-500/30 bg-brand-500/10 text-brand-400' :
                      'border-white/5 text-slate-600'
                    }`}>
                      {AGENT_LABELS[a].split(' ')[0]}
                    </div>
                  ))}
                </div>
                {/* Log */}
                <div className="bg-surface-950 rounded-xl p-2 max-h-28 overflow-y-auto font-mono text-[10px] space-y-0.5">
                  {ingestLog.slice(-20).map((l, i) => (
                    <div key={i} className={l.level === 'error' ? 'text-red-400' : l.level === 'success' ? 'text-emerald-400' : 'text-slate-500'}>
                      {l.msg}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* File Upload */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card space-y-3">
          <p className="font-semibold text-white text-sm flex items-center gap-2"><Upload size={14} /> Upload File</p>
          <p className="text-xs text-slate-500">CSV, Excel, PDF, DOCX → instant RAG</p>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.pdf,.docx,.json,.parquet" onChange={handleUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-ghost w-full flex items-center justify-center gap-2">
            {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> Choose File</>}
          </button>
        </motion.div>
      </div>

      {/* Right: Query + QA Pairs */}
      <div className="xl:col-span-2 space-y-4">
        {/* Query */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-3">
          <p className="font-semibold text-white text-sm flex items-center gap-2"><Search size={14} /> Test a Question</p>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="e.g. how many shipments are delivered?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
            />
            <button onClick={ask} disabled={asking} className="btn-primary flex items-center gap-2 shrink-0">
              {asking ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Ask
            </button>
          </div>

          <AnimatePresence>
            {answer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-950 rounded-xl p-4 border border-white/[0.06] space-y-2"
              >
                <p className="text-white text-sm leading-relaxed">{answer.text}</p>
                {answer.sql && (
                  <pre className="text-[11px] text-slate-400 bg-black/30 rounded-lg p-2 overflow-x-auto font-mono mt-1">{answer.sql}</pre>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <RouteBadge route={answer.route} />
                  <span className="text-xs text-slate-500">{formatMs(answer.ms)}</span>
                  {answer.score !== undefined && (
                    <span className="text-xs text-slate-500">score: {answer.score.toFixed(3)}</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* QA Pairs + Logs tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card space-y-3">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex bg-surface-950 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('qa')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'qa' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Pre-Generated Q&A
              </button>
              <button
                onClick={() => { setActiveTab('logs'); loadLogs() }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'logs' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <List size={11} /> Query Logs
              </button>
            </div>
            <button
              onClick={() => activeTab === 'qa' ? loadQA() : loadLogs()}
              className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {/* QA Pairs */}
          {activeTab === 'qa' && (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {qaPairs.length === 0 && (
                <p className="text-slate-600 text-sm text-center py-8">No Q&A pairs yet. Run pre-generation first.</p>
              )}
              {qaPairs.map((qa, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-surface-950 rounded-xl p-3 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                >
                  <p className="text-xs text-slate-500 mb-1">Q: {qa.question}</p>
                  <p className="text-sm text-white font-medium">{qa.answer}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-brand-400">{qa.category || 'general'}</span>
                    {qa.score > 0 && <span className="text-[10px] text-slate-600">score: {qa.score?.toFixed(3)}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Query Logs from Supabase */}
          {activeTab === 'logs' && (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {queryLogs.length === 0 && (
                <p className="text-slate-600 text-sm text-center py-8">No query logs yet.</p>
              )}
              {queryLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-surface-950 rounded-xl p-3 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs text-slate-400">{log.question}</p>
                    <span className="text-[10px] text-slate-600 shrink-0">{formatTime(new Date(log.created_at).getTime())}</span>
                  </div>
                  <p className="text-sm text-white">{log.answer}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <RouteBadge route={log.route as RAGRoute} />
                    <span className="text-[10px] text-slate-500">{formatMs(log.latency_ms)}</span>
                    {log.score != null && <span className="text-[10px] text-slate-600">score: {log.score.toFixed(3)}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
