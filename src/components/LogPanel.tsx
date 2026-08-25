import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatTime } from '../lib'
import type { LogEntry } from '../store'

const levelStyle = {
  info:    'text-slate-400',
  warn:    'text-yellow-400',
  error:   'text-red-400',
  success: 'text-emerald-400',
}
const levelBg = {
  info:    'bg-slate-500/10',
  warn:    'bg-yellow-500/10',
  error:   'bg-red-500/10',
  success: 'bg-emerald-500/10',
}

interface LogPanelProps {
  logs: LogEntry[]
  onClear: () => void
  maxHeight?: string
}

export function LogPanel({ logs, onClear, maxHeight = '280px' }: LogPanelProps) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Logs</p>
        <button onClick={onClear} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
          Clear
        </button>
      </div>
      <div className="overflow-y-auto font-mono text-xs space-y-0.5" style={{ maxHeight }}>
        <AnimatePresence initial={false}>
          {logs.length === 0 && (
            <p className="text-slate-600 text-center py-6">No logs yet</p>
          )}
          {logs.map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn('flex gap-2 px-2 py-1 rounded-lg', levelBg[log.level])}
            >
              <span className="text-slate-600 shrink-0">{formatTime(log.timestamp)}</span>
              <span className="text-slate-500 shrink-0">[{log.source}]</span>
              <span className={levelStyle[log.level]}>{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
