import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, ChevronDown, Shield, Clock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib'

export function UserMenu() {
  const { profile, user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  const roleColor = {
    admin:    'text-purple-400 bg-purple-500/10 border-purple-500/20',
    analyst:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
    user:     'text-slate-400 bg-slate-500/10 border-slate-500/20',
  }[profile?.role ?? 'user']

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass glass-hover transition-all"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-white leading-none">{profile?.name || 'User'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{profile?.tenant_id || 'demo'}</p>
        </div>
        <ChevronDown size={12} className={cn('text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 card border border-white/[0.08] shadow-2xl z-50"
          >
            {/* Profile header */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06] mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-surface-950 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-white">{profile?.total_queries ?? 0}</p>
                <p className="text-[10px] text-slate-500">Queries</p>
              </div>
              <div className="bg-surface-950 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-white">{profile?.total_sessions ?? 0}</p>
                <p className="text-[10px] text-slate-500">Sessions</p>
              </div>
            </div>

            {/* Role + tenant */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Shield size={11} /> Role
                </div>
                <span className={cn('badge border text-[10px]', roleColor)}>
                  {profile?.role ?? 'user'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User size={11} /> Tenant
                </div>
                <span className="text-xs text-slate-300">{profile?.tenant_id ?? '—'}</span>
              </div>
              {profile?.last_active && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={11} /> Last active
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(profile.last_active).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
