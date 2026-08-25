import { motion } from 'framer-motion'
import { cn } from '../lib'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: 'indigo' | 'green' | 'purple' | 'orange' | 'pink'
  delta?: string
  deltaUp?: boolean
  delay?: number
}

const colorMap = {
  indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
  green:  'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400',
  pink:   'from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400',
}

export function StatCard({ label, value, icon, color, delta, deltaUp, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card glass-hover relative overflow-hidden group cursor-default"
    >
      {/* bg glow */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', colorMap[color].split(' ').slice(0,2).join(' '))} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
          <motion.p
            key={String(value)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-white"
          >
            {value}
          </motion.p>
          {delta && (
            <p className={cn('text-xs mt-1 font-medium', deltaUp ? 'text-emerald-400' : 'text-red-400')}>
              {deltaUp ? '↑' : '↓'} {delta}
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl bg-gradient-to-br border', colorMap[color])}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
