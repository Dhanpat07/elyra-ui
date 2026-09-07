import { motion } from 'framer-motion'
import { cn } from '../lib'
import type { VoiceState } from '../store'

const stateConfig: Record<VoiceState, { label: string; color: string; ring: string; pulse: boolean }> = {
  IDLE:        { label: 'Idle',        color: 'bg-slate-500/20 text-slate-400',   ring: 'ring-slate-500/30',  pulse: false },
  LISTENING:   { label: 'Listening',   color: 'bg-emerald-500/20 text-emerald-400', ring: 'ring-emerald-500/40', pulse: true },
  PREDICTING:  { label: 'Predicting',  color: 'bg-indigo-500/20 text-indigo-400',  ring: 'ring-indigo-500/40',  pulse: true },
  GENERATING:  { label: 'Generating',  color: 'bg-orange-500/20 text-orange-400',  ring: 'ring-orange-500/40',  pulse: true },
  SPEAKING:    { label: 'Speaking',    color: 'bg-sky-500/20 text-sky-400',         ring: 'ring-sky-500/40',     pulse: true },
  BARGE_IN:    { label: 'Barge-in',    color: 'bg-purple-500/20 text-purple-400',  ring: 'ring-purple-500/40',  pulse: true },
}

// Default fallback for unknown states
const defaultConfig = { label: 'Unknown', color: 'bg-slate-500/20 text-slate-400', ring: 'ring-slate-500/30', pulse: false }

export function VoiceStateBadge({ state }: { state: VoiceState }) {
  const cfg = stateConfig[state] || defaultConfig
  
  return (
    <motion.span
      key={state}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('badge ring-1 font-semibold', cfg.color, cfg.ring)}
    >
      {cfg.pulse && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse',
          state === 'LISTENING' ? 'bg-emerald-400' :
          state === 'SPEAKING'  ? 'bg-sky-400' :
          state === 'BARGE_IN'  ? 'bg-purple-400' : 'bg-indigo-400'
        )} />
      )}
      {cfg.label}
    </motion.span>
  )
}
