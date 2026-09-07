import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  TrendingUp,
  Zap,
  Bot,
  Database,
  ArrowRight,
  Play,
  BarChart3,
  CheckCircle2,
  Circle,
  Sparkles,
  Clock,
  Users,
  CreditCard,
  MessageSquare,
  Settings,
  Bell,
  Rocket,
  Gift,
  Target,
  Award,
  Calendar,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useStore } from '../store';
import { cn } from '../lib';

// Onboarding checklist items
const ONBOARDING_STEPS = [
  { id: 'profile', label: 'Complete your profile', icon: Users, done: true },
  { id: 'data', label: 'Connect your first data source', icon: Database, done: true },
  { id: 'agent', label: 'Create a voice agent', icon: Bot, done: false },
  { id: 'test', label: 'Make a test call', icon: Phone, done: false },
  { id: 'live', label: 'Go live with your agent', icon: Rocket, done: false },
];

// Quick actions
const QUICK_ACTIONS = [
  { label: 'Create Agent', icon: Bot, color: 'from-gold-500 to-amber-600', page: 'agents' },
  { label: 'View Analytics', icon: BarChart3, color: 'from-emerald-500 to-cyan-600', page: 'analytics' },
  { label: 'Connect Data', icon: Database, color: 'from-purple-500 to-indigo-600', page: 'connectors' },
  { label: 'Test Voice', icon: Play, color: 'from-pink-500 to-rose-600', page: 'voice' },
];

// Recent activity feed
const RECENT_ACTIVITY = [
  { id: 1, type: 'call', message: 'Support agent handled call from +91 98765...', time: '2 min ago', icon: Phone, color: 'text-emerald-400' },
  { id: 2, type: 'agent', message: 'Sales Agent updated with new knowledge', time: '15 min ago', icon: Bot, color: 'text-purple-400' },
  { id: 3, type: 'data', message: 'CRM sync completed - 156 new records', time: '1 hour ago', icon: Database, color: 'text-blue-400' },
  { id: 4, type: 'billing', message: 'Invoice #INV-2024-003 generated', time: '3 hours ago', icon: FileText, color: 'text-gold-400' },
  { id: 5, type: 'alert', message: 'High call volume detected - scaling up', time: '5 hours ago', icon: Bell, color: 'text-orange-400' },
];

// Tips and features
const TIPS = [
  { title: 'Multi-language Support', description: 'Your agents can now speak 10+ Indian languages!', icon: MessageSquare, color: 'from-gold-500/20 to-amber-500/10' },
  { title: 'Smart Escalation', description: 'Set up automatic escalation rules for complex queries', icon: Target, color: 'from-purple-500/20 to-indigo-500/10' },
  { title: 'Analytics Insights', description: 'Check sentiment analysis to improve customer satisfaction', icon: Award, color: 'from-emerald-500/20 to-cyan-500/10' },
];

export function DashboardPage() {
  const { profile, organization } = useAuthContext();
  const { setActivePage } = useStore();
  
  // Calculate onboarding progress
  const completedSteps = ONBOARDING_STEPS.filter(s => s.done).length;
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  // Plan usage (mock data - would come from API)
  const planUsage = {
    minutesUsed: 847,
    minutesTotal: 1000,
    agentsUsed: 2,
    agentsTotal: 3,
    plan: organization?.plan || 'starter',
  };

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {getGreeting()}, {firstName}! 👋
          </h2>
          <p className="text-slate-500 mt-1">
            Here's your LAALI overview for today
          </p>
        </div>
        
        {/* Date */}
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Metrics - Only unique ones */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Agents', value: planUsage.agentsUsed, subtext: `of ${planUsage.agentsTotal}`, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Minutes Used', value: planUsage.minutesUsed, subtext: `of ${planUsage.minutesTotal}`, icon: Clock, color: 'text-gold-400', bg: 'bg-gold-500/10' },
              { label: 'Cost Saved', value: '₹48,500', subtext: 'this month', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Avg Response', value: '45ms', subtext: '-8% faster', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-800 rounded-2xl border border-white/[0.05] p-4 hover:border-white/[0.1] transition-all"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", metric.bg)}>
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                </div>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className="text-xs text-slate-500 mt-1">{metric.label}</div>
                <div className="text-xs text-slate-600 mt-0.5">{metric.subtext}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => setActivePage(action.page)}
                  className={cn(
                    "p-4 rounded-xl bg-gradient-to-br text-white font-medium",
                    "hover:scale-105 transition-all shadow-lg",
                    action.color
                  )}
                >
                  <action.icon className="w-6 h-6 mb-2" />
                  <span className="text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-gold-400" />
                Recent Activity
              </h3>
              <button className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0", activity.color)}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{activity.message}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          
          {/* Onboarding Progress */}
          {progressPercent < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gold-500/10 to-amber-500/5 rounded-2xl border border-gold-500/20 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-gold-400" />
                  Getting Started
                </h3>
                <span className="text-sm text-gold-400 font-medium">{progressPercent}%</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2 bg-surface-700 rounded-full mb-4 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                {ONBOARDING_STEPS.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-colors",
                      step.done ? "opacity-60" : "hover:bg-white/[0.05] cursor-pointer"
                    )}
                    onClick={() => !step.done && setActivePage(step.id === 'agent' ? 'agents' : step.id === 'data' ? 'connectors' : 'voice')}
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                    <span className={cn("text-sm", step.done ? "text-slate-500 line-through" : "text-slate-300")}>
                      {step.label}
                    </span>
                    {!step.done && (
                      <ArrowRight className="w-4 h-4 text-gold-400 ml-auto" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Plan Usage */}
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-400" />
                Plan Usage
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-gold-500/20 text-gold-400 font-medium capitalize">
                {planUsage.plan}
              </span>
            </div>

            {/* Minutes usage */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">Minutes</span>
                <span className="text-white font-medium">{planUsage.minutesUsed} / {planUsage.minutesTotal}</span>
              </div>
              <div className="w-full h-2 bg-surface-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    planUsage.minutesUsed / planUsage.minutesTotal > 0.9 
                      ? "bg-red-500" 
                      : planUsage.minutesUsed / planUsage.minutesTotal > 0.7 
                        ? "bg-amber-500" 
                        : "bg-emerald-500"
                  )}
                  style={{ width: `${(planUsage.minutesUsed / planUsage.minutesTotal) * 100}%` }}
                />
              </div>
            </div>

            {/* Agents usage */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">Agents</span>
                <span className="text-white font-medium">{planUsage.agentsUsed} / {planUsage.agentsTotal}</span>
              </div>
              <div className="w-full h-2 bg-surface-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${(planUsage.agentsUsed / planUsage.agentsTotal) * 100}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => setActivePage('billing')}
              className="w-full mt-2 py-2.5 rounded-xl bg-gold-500/10 text-gold-400 font-medium hover:bg-gold-500/20 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade Plan
            </button>
          </div>

          {/* Tips & Features */}
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              Tips & Features
            </h3>
            <div className="space-y-3">
              {TIPS.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={cn("p-3 rounded-xl bg-gradient-to-r cursor-pointer hover:scale-[1.02] transition-all", tip.color)}
                >
                  <div className="flex items-start gap-3">
                    <tip.icon className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-white">{tip.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{tip.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 rounded-2xl border border-purple-500/20 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Need Help?</h4>
                <p className="text-xs text-slate-400 mt-1">Chat with LAALI or contact our support team</p>
                <button 
                  onClick={() => setActivePage('laali')}
                  className="mt-3 text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                >
                  Chat with LAALI
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
