import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface Field { label: string; key: string; type?: string; placeholder?: string }

const BRIDGE_FIELDS: Field[] = [
  { label: 'Voice Agent WebSocket', key: 'voiceWs',    placeholder: 'ws://localhost:8000/ws' },
  { label: 'RAG API URL',           key: 'ragUrl',     placeholder: 'http://localhost:8001' },
  { label: 'Bridge Port',           key: 'bridgePort', placeholder: '8002' },
  { label: 'Default Tenant',        key: 'tenant',     placeholder: 'demo' },
]

const RAG_FIELDS: Field[] = [
  { label: 'Cache Threshold',    key: 'cacheThreshold', placeholder: '0.68' },
  { label: 'Rate Limit/min',     key: 'rateLimit',      placeholder: '100' },
  { label: 'SQL Max Rows',       key: 'sqlMaxRows',     placeholder: '100' },
  { label: 'SQL Timeout (s)',    key: 'sqlTimeout',     placeholder: '10' },
]

const KEYWORDS = [
  'how many','how much','what is the','show me','tell me about',
  'count','total','sum','average','top','list','revenue','sales',
  'shipment','delivery','status','pending','delivered'
]

export function SettingsPage() {
  const [bridgeCfg, setBridgeCfg] = useState<Record<string, string>>({})
  const [ragCfg,    setRagCfg]    = useState<Record<string, string>>({})
  const [keywords,  setKeywords]  = useState(KEYWORDS)
  const [newKw,     setNewKw]     = useState('')
  const [showKeys,  setShowKeys]  = useState(false)

  function save() {
    toast.success('Configuration saved (local only — restart services to apply)')
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-4xl">
      {/* Bridge config */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
        <p className="font-semibold text-white">Bridge Configuration</p>
        {BRIDGE_FIELDS.map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider">{f.label}</label>
            <input
              className="input-field"
              placeholder={f.placeholder}
              value={bridgeCfg[f.key] ?? ''}
              onChange={e => setBridgeCfg(p => ({ ...p, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <button onClick={save} className="btn-primary flex items-center gap-2">
          <Save size={14} /> Save
        </button>
      </motion.div>

      {/* RAG config */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card space-y-4">
        <p className="font-semibold text-white">RAG Configuration</p>
        {RAG_FIELDS.map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider">{f.label}</label>
            <input
              className="input-field"
              placeholder={f.placeholder}
              value={ragCfg[f.key] ?? ''}
              onChange={e => setRagCfg(p => ({ ...p, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <button onClick={save} className="btn-primary flex items-center gap-2">
          <Save size={14} /> Save
        </button>
      </motion.div>

      {/* Keywords */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card space-y-4 xl:col-span-2">
        <p className="font-semibold text-white">Data Question Keywords</p>
        <p className="text-xs text-slate-500">Questions containing these keywords trigger RAG lookup</p>
        <div className="flex flex-wrap gap-2">
          {keywords.map(kw => (
            <span
              key={kw}
              onClick={() => setKeywords(k => k.filter(x => x !== kw))}
              className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 cursor-pointer hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors"
              title="Click to remove"
            >
              {kw} ×
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Add keyword…"
            value={newKw}
            onChange={e => setNewKw(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newKw.trim()) {
                setKeywords(k => [...k, newKw.trim()])
                setNewKw('')
              }
            }}
          />
          <button
            onClick={() => { if (newKw.trim()) { setKeywords(k => [...k, newKw.trim()]); setNewKw('') } }}
            className="btn-ghost"
          >
            Add
          </button>
        </div>
      </motion.div>

      {/* API Keys info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card space-y-3 xl:col-span-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-white">API Keys</p>
          <button onClick={() => setShowKeys(s => !s)} className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3">
            {showKeys ? <EyeOff size={12} /> : <Eye size={12} />}
            {showKeys ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-slate-500">API keys are managed via <code className="text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">.env</code> files in each service repo. Never commit real keys.</p>
        {showKeys && (
          <div className="space-y-2 font-mono text-xs">
            {[
              { label: 'DEEPGRAM_API_KEY',  repo: 'voice-agent-mvp' },
              { label: 'GROQ_API_KEY',      repo: 'voice-agent-mvp' },
              { label: 'CARTESIA_API_KEY',  repo: 'voice-agent-mvp' },
              { label: 'OPENAI_API_KEY',    repo: 'elyra-rag' },
              { label: 'JWT_SECRET_KEY',    repo: 'voice-agent-mvp' },
            ].map(k => (
              <div key={k.label} className="flex items-center justify-between bg-surface-950 rounded-xl px-3 py-2">
                <span className="text-brand-400">{k.label}</span>
                <span className="text-slate-600">{k.repo}/.env</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
