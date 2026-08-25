import { motion } from 'framer-motion'
import { cn } from '../lib'
import type { ServiceStatus } from '../store'

interface ServiceCardProps {
  name: string
  port: number
  status: ServiceStatus
  icon: React.ReactNode
  metrics?: { label: string; value: string }[]
}

const statusConfig = {
  up:       { dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Healthy' },
  down:     { dot: 'bg-red-400',     badge: 'bg-red-500/10 text-red-400 border-red-500/20',             label: 'Down' },
  checking: { dot: 'bg-yellow-400',  badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',    label: 'Checking' },
}

export function ServiceCard({ name, port, status, icon, metrics }: ServiceCardProps) {
  const cfg = statusConfig[status]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card glass-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">{icon}</div>
          <div>
            <p className="font-semibold text-white text-sm">{name}</p>
            <p className="text-xs text-slate-500">localhost:{port}</p>
          </div>
        </div>
        <div className={cn('badge border', cfg.badge)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot, status === 'checking' && 'animate-pulse')} />
          {cfg.label}
        </div>
      </div>
      {metrics && (
        <div className="grid grid-cols-2 gap-2">
          {metrics.map(m => (
            <div key={m.label} className="bg-surface-950 rounded-xl p-2.5">
              <p className="text-xs text-slate-500">{m.label}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
