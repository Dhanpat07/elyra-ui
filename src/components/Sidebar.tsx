import { motion } from 'framer-motion'
import {
  LayoutDashboard, Mic, Database, Activity,
  Settings, Zap, ChevronRight, Phone, Building2, CreditCard, Plug
} from 'lucide-react'
import { cn } from '../lib'
import { useStore } from '../store'

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'portal',      label: 'My Platform',  icon: Building2 },
  { id: 'callcenter',  label: 'Call Center',  icon: Phone },
  { id: 'billing',     label: 'Billing',      icon: CreditCard },
  { id: 'connectors',  label: 'Connectors',   icon: Plug },
  { id: 'voice',       label: 'Voice Agent',  icon: Mic },
  { id: 'rag',         label: 'RAG Engine',   icon: Database },
  { id: 'metrics',     label: 'Metrics',      icon: Activity },
  { id: 'settings',    label: 'Settings',     icon: Settings },
]

export function Sidebar() {
  const { activePage, setActivePage, health } = useStore()

  const overallHealth = Object.values(health).every(s => s === 'up')
    ? 'up' : Object.values(health).some(s => s === 'down') ? 'down' : 'checking'

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/[0.05] bg-surface-950/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-600/30 animate-glow">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Elyra</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Voice · RAG · Bridge</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                active
                  ? 'bg-brand-600/20 text-brand-400 glow-border'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-brand-600/10 border border-brand-500/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon size={16} className="relative z-10 shrink-0" />
              <span className="relative z-10">{item.label}</span>
              {active && <ChevronRight size={12} className="relative z-10 ml-auto text-brand-400" />}
            </button>
          )
        })}
      </nav>

      {/* System status */}
      <div className="px-4 py-4 border-t border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'w-2 h-2 rounded-full',
            overallHealth === 'up'       ? 'bg-emerald-400 animate-pulse' :
            overallHealth === 'down'     ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
          )} />
          <div>
            <p className="text-xs font-medium text-slate-400">System Status</p>
            <p className={cn('text-xs',
              overallHealth === 'up' ? 'text-emerald-400' :
              overallHealth === 'down' ? 'text-red-400' : 'text-yellow-400'
            )}>
              {overallHealth === 'up' ? 'All systems operational' :
               overallHealth === 'down' ? 'Service degraded' : 'Checking...'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
