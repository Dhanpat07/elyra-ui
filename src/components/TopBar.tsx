import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useStore } from '../store';
import { cn } from '../lib';

interface TopBarProps {
  title: string;
  description: string;
}

// Mock notifications
const NOTIFICATIONS = [
  {
    id: '1',
    type: 'success',
    title: 'Setup Complete',
    message: 'Your voice agent is ready to handle calls',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Usage Alert',
    message: "You've used 80% of your monthly quota",
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'New Feature',
    message: 'Multi-language support is now available',
    time: '1 day ago',
    read: true,
  },
];

export function TopBar({ title, description }: TopBarProps) {
  const { profile, signOut } = useAuthContext();
  const { setActivePage } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-surface-900/80 backdrop-blur-xl">
      {/* Left: Title */}
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search Placeholder */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800 border border-white/[0.05] text-slate-500">
          <Search size={16} />
          <span className="text-sm">Search...</span>
          <div className="flex items-center gap-0.5 ml-2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-surface-700 rounded text-slate-400">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-surface-700 rounded text-slate-400">K</kbd>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">Live</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={cn(
              'p-2.5 rounded-xl transition-all relative',
              showNotifications
                ? 'bg-brand-600/20 text-brand-400'
                : 'bg-surface-800 border border-white/[0.05] text-slate-400 hover:text-white'
            )}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-surface-800 rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="text-xs text-brand-400 hover:text-brand-300">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-auto">
                  {NOTIFICATIONS.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer',
                        !notif.read && 'bg-brand-500/5'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          notif.type === 'success' && 'bg-emerald-500/10',
                          notif.type === 'warning' && 'bg-yellow-500/10',
                          notif.type === 'info' && 'bg-blue-500/10'
                        )}>
                          {notif.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
                          {notif.type === 'warning' && <AlertCircle size={16} className="text-yellow-400" />}
                          {notif.type === 'info' && <MessageSquare size={16} className="text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-white/[0.05]">
                  <button className="w-full text-center text-xs text-slate-400 hover:text-white py-1">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className={cn(
              'flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all',
              showUserMenu
                ? 'bg-brand-600/20'
                : 'bg-surface-800 border border-white/[0.05] hover:border-white/[0.1]'
            )}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <ChevronDown size={14} className={cn(
              'text-slate-500 transition-transform',
              showUserMenu && 'rotate-180'
            )} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 bg-surface-800 rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/[0.05]">
                  <p className="font-semibold text-white text-sm">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{profile?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-brand-500/20 text-brand-400 rounded-full">
                      {profile?.role || 'Member'}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {profile?.tenant_id}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                  >
                    <User size={16} />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('billing');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                  >
                    <CreditCard size={16} />
                    Billing & Plans
                  </button>
                  <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors">
                    <HelpCircle size={16} />
                    Help & Support
                  </button>
                </div>

                {/* Sign Out */}
                <div className="py-2 border-t border-white/[0.05]">
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
