import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Mic,
  Database,
  Settings,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Plug,
  Bot,
  BarChart3,
  Rocket,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { cn } from '../lib';
import { useStore } from '../store';
import { useAuthContext } from '../contexts/AuthContext';
import { ElyraLogo } from './Logo';
import { ADMIN_EMAIL } from '../pages/AdminDashboardPage';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  needsOnboarding?: boolean;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
  { id: 'agents', label: 'Voice Agents', icon: Bot, section: 'main' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'main' },
  { id: 'connectors', label: 'Data Sources', icon: Plug, section: 'main' },
  { id: 'billing', label: 'Billing', icon: CreditCard, section: 'main' },
  { id: 'voice', label: 'Voice Console', icon: Mic, section: 'dev' },
  { id: 'rag', label: 'RAG Engine', icon: Database, section: 'dev' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'settings' },
];

export function Sidebar({ collapsed = false, onToggle, needsOnboarding }: SidebarProps) {
  const { activePage, setActivePage, health } = useStore();
  const { organization, profile } = useAuthContext();

  // Check if current user is admin
  const isAdmin = profile?.email === ADMIN_EMAIL;

  const overallHealth = Object.values(health).every(s => s === 'up')
    ? 'up' : Object.values(health).some(s => s === 'down') ? 'down' : 'checking';

  const mainNav = NAV_ITEMS.filter(item => item.section === 'main');
  const devNav = NAV_ITEMS.filter(item => item.section === 'dev');
  const settingsNav = NAV_ITEMS.filter(item => item.section === 'settings');

  return (
    <aside className={cn(
      'flex flex-col h-screen sticky top-0 border-r border-white/[0.05] bg-surface-950/90 backdrop-blur-xl transition-all duration-300',
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-white/[0.05] transition-all',
        collapsed ? 'px-4 py-5 justify-center' : 'px-5 py-5'
      )}>
        {collapsed ? (
          <ElyraLogo variant="icon" size="sm" />
        ) : (
          <ElyraLogo size="sm" showTagline={!organization?.name} />
        )}
      </div>

      {/* Onboarding Banner */}
      {needsOnboarding && !collapsed && (
        <div className="mx-3 mt-4">
          <button
            onClick={() => setActivePage('onboarding')}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-brand-600/20 to-purple-600/20 border border-brand-500/30 hover:border-brand-500/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <Rocket size={16} className="text-brand-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Get Started</p>
                <p className="text-[10px] text-slate-500">Setup in 3 steps</p>
              </div>
              <ChevronRight size={14} className="text-brand-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-auto">
        {/* Main Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Platform
            </p>
          )}
          <div className="space-y-1">
            {mainNav.map(item => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                    collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                    active
                      ? 'bg-brand-600/20 text-brand-400'
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
                  <item.icon size={18} className="relative z-10 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="relative z-10">{item.label}</span>
                      {active && <ChevronRight size={14} className="relative z-10 ml-auto text-brand-400" />}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Developer Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Developer
            </p>
          )}
          <div className="space-y-1">
            {devNav.map(item => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                    collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                    active
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                  )}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Account
            </p>
          )}
          <div className="space-y-1">
            {settingsNav.map(item => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                    collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                    active
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                  )}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Section - Only visible to admin */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold text-red-500/70 uppercase tracking-wider mb-2">
                Admin
              </p>
            )}
            <div className="space-y-1">
              <button
                onClick={() => setActivePage('admin')}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                  collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                  activePage === 'admin'
                    ? 'bg-red-600/20 text-red-400'
                    : 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                )}
              >
                <Shield size={18} className="flex-shrink-0" />
                {!collapsed && <span>Admin Panel</span>}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Help & Feedback */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-white/[0.05]">
          <div className="p-3 rounded-xl bg-surface-900/50 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Need help?</p>
                <p className="text-[10px] text-slate-500">We're here for you</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-2 py-1.5 rounded-lg bg-surface-800 text-[10px] font-medium text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                <HelpCircle size={12} />
                Docs
              </button>
              <button className="flex-1 px-2 py-1.5 rounded-lg bg-surface-800 text-[10px] font-medium text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                <MessageSquare size={12} />
                Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className={cn(
        'border-t border-white/[0.05] transition-all',
        collapsed ? 'px-3 py-4' : 'px-4 py-4'
      )}>
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          <div className={cn(
            'w-2.5 h-2.5 rounded-full flex-shrink-0',
            overallHealth === 'up' ? 'bg-emerald-400 animate-pulse' :
            overallHealth === 'down' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
          )} />
          {!collapsed && (
            <div>
              <p className="text-[10px] font-medium text-slate-400">System Status</p>
              <p className={cn('text-[10px]',
                overallHealth === 'up' ? 'text-emerald-400' :
                overallHealth === 'down' ? 'text-red-400' : 'text-yellow-400'
              )}>
                {overallHealth === 'up' ? 'All systems operational' :
                 overallHealth === 'down' ? 'Service degraded' : 'Checking...'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-800 border border-white/[0.1] flex items-center justify-center text-slate-500 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}
    </aside>
  );
}
