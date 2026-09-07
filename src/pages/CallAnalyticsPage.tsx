import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Play,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '../lib';
import { useCalls, useCallAnalytics } from '../hooks/useSupabase';

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#6366f1', 
  negative: '#ef4444',
};

export function CallAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const { calls, loading: callsLoading } = useCalls({ limit: 10 });
  const { analytics, loading: analyticsLoading } = useCallAnalytics(timeRange);

  const loading = callsLoading || analyticsLoading;

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time ago
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Prepare chart data
  const sentimentData = analytics ? [
    { name: 'Positive', value: analytics.sentimentBreakdown.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: analytics.sentimentBreakdown.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: analytics.sentimentBreakdown.negative, color: SENTIMENT_COLORS.negative },
  ] : [];

  const hourlyData = analytics?.hourlyData || [];

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Call Analytics</h2>
          <p className="text-slate-500 mt-1">Insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range */}
          <div className="flex items-center gap-2 bg-surface-800 rounded-xl p-1">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  timeRange === range
                    ? 'bg-gold-500 text-surface-900'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Export */}
          <button className="px-4 py-2.5 rounded-xl bg-surface-800 border border-white/[0.05] text-slate-400 hover:text-white transition-all flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Calls',
            value: analytics?.totalCalls.toLocaleString() || '0',
            change: '+12.5%',
            trend: 'up',
            icon: Phone,
            color: 'gold',
          },
          {
            label: 'Avg Duration',
            value: analytics ? formatDuration(Math.round(analytics.avgDuration)) : '0:00',
            change: '+8.3%',
            trend: 'up',
            icon: Clock,
            color: 'purple',
          },
          {
            label: 'Success Rate',
            value: analytics ? `${Math.round((analytics.completedCalls / (analytics.totalCalls || 1)) * 100)}%` : '0%',
            change: '+2.1%',
            trend: 'up',
            icon: TrendingUp,
            color: 'emerald',
          },
          {
            label: 'Avg Response',
            value: '45ms',
            change: '-8.3%',
            trend: 'down',
            icon: Zap,
            color: 'blue',
          },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                metric.color === 'gold' && "bg-gold-500/10 text-gold-400",
                metric.color === 'purple' && "bg-purple-500/10 text-purple-400",
                metric.color === 'emerald' && "bg-emerald-500/10 text-emerald-400",
                metric.color === 'blue' && "bg-blue-500/10 text-blue-400",
              )}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                metric.trend === 'up' ? "text-emerald-400" : "text-red-400"
              )}>
                {metric.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {metric.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{metric.value}</div>
            <div className="text-sm text-slate-500 mt-1">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Call Volume Chart */}
        <div className="lg:col-span-2 bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Call Volume</h3>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#f59e0b" strokeWidth={2} fill="url(#callGradient)" />
                <Area type="monotone" dataKey="handled" stroke="#10b981" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-500">
              No call data for this period
            </div>
          )}
        </div>

        {/* Sentiment Chart */}
        <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Sentiment</h3>
          {sentimentData.some(s => s.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {sentimentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-400">{item.name}</span>
                    <span className="text-xs text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500">
              No sentiment data yet
            </div>
          )}
        </div>
      </div>

      {/* Top Intents & Recent Calls */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Intents */}
        <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Top Intents</h3>
          {analytics?.topIntents && analytics.topIntents.length > 0 ? (
            <div className="space-y-3">
              {analytics.topIntents.map((intent, i) => {
                const percentage = Math.round((intent.count / (analytics.totalCalls || 1)) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-300">{intent.intent}</span>
                      <span className="text-slate-500">{intent.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-surface-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-full bg-gold-500/50 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500">
              No intent data yet
            </div>
          )}
        </div>

        {/* Recent Calls */}
        <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Calls</h3>
          {calls.length > 0 ? (
            <div className="space-y-3">
              {calls.slice(0, 6).map((call) => (
                <div
                  key={call.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/50 hover:bg-surface-700 transition-colors"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    call.sentiment === 'positive' && "bg-emerald-500/20 text-emerald-400",
                    call.sentiment === 'neutral' && "bg-blue-500/20 text-blue-400",
                    call.sentiment === 'negative' && "bg-red-500/20 text-red-400",
                    !call.sentiment && "bg-slate-500/20 text-slate-400",
                  )}>
                    {call.sentiment === 'positive' && <ThumbsUp size={18} />}
                    {call.sentiment === 'neutral' && <Minus size={18} />}
                    {call.sentiment === 'negative' && <ThumbsDown size={18} />}
                    {!call.sentiment && <Phone size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium truncate">
                        {call.caller_phone || 'Unknown'}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        call.status === 'completed' && "bg-emerald-500/20 text-emerald-400",
                        call.status === 'missed' && "bg-red-500/20 text-red-400",
                        call.status === 'escalated' && "bg-amber-500/20 text-amber-400",
                      )}>
                        {call.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{call.agent?.name || 'Unknown Agent'}</span>
                      <span>{formatDuration(call.duration_seconds)}</span>
                      <span>{timeAgo(call.started_at)}</span>
                    </div>
                  </div>
                  {call.recording_url && (
                    <button className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors">
                      <Play size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500">
              No calls yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
