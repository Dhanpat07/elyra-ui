import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Sidebar }       from './components/Sidebar'
import { UserMenu }      from './components/UserMenu'
import { AuthPage }      from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { TenantPortalPage } from './pages/TenantPortalPage'
import { CallCenterPage } from './pages/CallCenterPage'
import BillingPage from './pages/BillingPage'
import DataConnectorsPage from './pages/DataConnectorsPage'
import { VoicePage }     from './pages/VoicePage'
import { RAGPage }       from './pages/RAGPage'
import { MetricsPage }   from './pages/MetricsPage'
import { SettingsPage }  from './pages/SettingsPage'
import { useStore }      from './store'
import { useAuth }       from './hooks/useAuth'

const PAGE_TITLES: Record<string, string> = {
  dashboard:  'Dashboard',
  portal:     'My Platform',
  callcenter: 'Call Center',
  billing:    'Billing & Usage',
  connectors: 'Data Connectors',
  voice:      'Voice Agent',
  rag:        'RAG Engine',
  metrics:    'Metrics',
  settings:   'Settings',
}

export default function App() {
  const { activePage } = useStore()
  const { user, initialized, init, profile } = useAuth()

  useEffect(() => { init() }, [])

  // Loading splash
  if (!initialized) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-brand-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading Elyra…</p>
        </div>
      </div>
    )
  }

  // Not logged in → show auth page
  if (!user) return <AuthPage />

  return (
    <div className="flex min-h-screen bg-grid-pattern">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05] bg-surface-900/80 backdrop-blur-xl">
          <div>
            <h1 className="text-base font-bold text-white">{PAGE_TITLES[activePage]}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile?.tenant_id ?? 'demo'} · Elyra Platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500">Live</span>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === 'dashboard'  && <DashboardPage />}
              {activePage === 'portal'     && <TenantPortalPage />}
              {activePage === 'callcenter' && <CallCenterPage />}
              {activePage === 'billing'    && <BillingPage />}
              {activePage === 'connectors' && <DataConnectorsPage />}
              {activePage === 'voice'      && <VoicePage />}
              {activePage === 'rag'        && <RAGPage />}
              {activePage === 'metrics'    && <MetricsPage />}
              {activePage === 'settings'   && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster
        theme="dark"
        toastOptions={{
          style: { background: '#13131f', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }
        }}
      />
    </div>
  )
}
