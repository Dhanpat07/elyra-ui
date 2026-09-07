import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  TrendingUp,
  Phone,
  DollarSign,
  Activity,
  Search,
  Download,
  Eye,
  Ban,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  Globe,
  Zap,
  Server,
  Shield,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib';

// Admin email - ONLY this user can access admin dashboard
export const ADMIN_EMAIL = 'dhanpat.dm001@gmail.com';

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
  company: string;
  tenant_id: string;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  calls_count: number;
  mrr: number;
  created_at: string;
  last_active: string;
  country: string;
}

interface PlatformStats {
  total_users: number;
  active_users: number;
  total_organizations: number;
  total_calls: number;
  mrr: number;
  arr: number;
  avg_response_time: number;
  success_rate: number;
}

// Mock data
const MOCK_STATS: PlatformStats = {
  total_users: 1247,
  active_users: 892,
  total_organizations: 456,
  total_calls: 2847562,
  mrr: 48750,
  arr: 585000,
  avg_response_time: 42,
  success_rate: 97.8,
};

const MOCK_USERS: User[] = [
  { id: '1', email: 'john@techcorp.com', full_name: 'John Smith', company: 'TechCorp', tenant_id: 'techcorp', plan: 'enterprise', status: 'active', calls_count: 125430, mrr: 999, created_at: '2024-01-15', last_active: '2 min ago', country: 'US' },
  { id: '2', email: 'priya@fastship.in', full_name: 'Priya Patel', company: 'FastShip', tenant_id: 'fastship', plan: 'growth', status: 'active', calls_count: 89420, mrr: 199, created_at: '2024-02-01', last_active: '5 min ago', country: 'IN' },
  { id: '3', email: 'alex@startup.io', full_name: 'Alex Chen', company: 'StartupXYZ', tenant_id: 'startupxyz', plan: 'starter', status: 'active', calls_count: 34210, mrr: 49, created_at: '2024-02-15', last_active: '1 hour ago', country: 'US' },
  { id: '4', email: 'maria@retail.es', full_name: 'Maria Garcia', company: 'RetailMax', tenant_id: 'retailmax', plan: 'growth', status: 'active', calls_count: 67890, mrr: 199, created_at: '2024-03-01', last_active: '3 hours ago', country: 'ES' },
  { id: '5', email: 'raj@ecom.in', full_name: 'Raj Kumar', company: 'EcomIndia', tenant_id: 'ecomindia', plan: 'enterprise', status: 'active', calls_count: 156780, mrr: 999, created_at: '2024-03-15', last_active: '10 min ago', country: 'IN' },
  { id: '6', email: 'sarah@health.co', full_name: 'Sarah Wilson', company: 'HealthCare Plus', tenant_id: 'healthcare', plan: 'growth', status: 'inactive', calls_count: 23450, mrr: 0, created_at: '2024-04-01', last_active: '2 days ago', country: 'UK' },
  { id: '7', email: 'mike@finance.com', full_name: 'Mike Johnson', company: 'FinanceHub', tenant_id: 'financehub', plan: 'starter', status: 'active', calls_count: 12340, mrr: 49, created_at: '2024-04-15', last_active: '30 min ago', country: 'US' },
  { id: '8', email: 'lisa@travel.de', full_name: 'Lisa Mueller', company: 'TravelGo', tenant_id: 'travelgo', plan: 'free', status: 'active', calls_count: 890, mrr: 0, created_at: '2024-05-01', last_active: '1 day ago', country: 'DE' },
];

const REVENUE_DATA = [
  { month: 'Jan', mrr: 32000, users: 180 },
  { month: 'Feb', mrr: 35500, users: 220 },
  { month: 'Mar', mrr: 38200, users: 280 },
  { month: 'Apr', mrr: 41800, users: 340 },
  { month: 'May', mrr: 45100, users: 390 },
  { month: 'Jun', mrr: 48750, users: 456 },
];

const PLAN_DISTRIBUTION = [
  { name: 'Free', value: 45, color: '#64748b' },
  { name: 'Starter', value: 30, color: '#6366f1' },
  { name: 'Growth', value: 18, color: '#8b5cf6' },
  { name: 'Enterprise', value: 7, color: '#10b981' },
];

const CALLS_BY_HOUR = [
  { hour: '00', calls: 1200 },
  { hour: '04', calls: 800 },
  { hour: '08', calls: 4500 },
  { hour: '12', calls: 7800 },
  { hour: '16', calls: 6500 },
  { hour: '20', calls: 3400 },
];

const COUNTRY_STATS = [
  { country: 'India', flag: '🇮🇳', users: 156, revenue: 18500 },
  { country: 'United States', flag: '🇺🇸', users: 134, revenue: 22400 },
  { country: 'United Kingdom', flag: '🇬🇧', users: 67, revenue: 8900 },
  { country: 'Germany', flag: '🇩🇪', users: 45, revenue: 5200 },
  { country: 'Spain', flag: '🇪🇸', users: 34, revenue: 3800 },
];

type AdminTab = 'overview' | 'users' | 'revenue' | 'system';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users] = useState<User[]>(MOCK_USERS);
  const [stats] = useState<PlatformStats>(MOCK_STATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const usersPerPage = 10;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users & Orgs', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'system', label: 'System Health', icon: Server },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <Shield size={24} className="text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded-full">
                LAALI AI
              </span>
            </div>
            <p className="text-slate-500 mt-0.5">Platform management & analytics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-surface-800 border border-white/[0.05] text-slate-400 hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-surface-800 border border-white/[0.05] text-slate-400 hover:text-white transition-all flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-surface-800 rounded-xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.total_users.toLocaleString(), change: '+12.5%', trend: 'up', icon: Users, color: 'brand' },
              { label: 'Organizations', value: stats.total_organizations.toLocaleString(), change: '+8.3%', trend: 'up', icon: Building2, color: 'purple' },
              { label: 'MRR', value: `$${stats.mrr.toLocaleString()}`, change: '+15.2%', trend: 'up', icon: DollarSign, color: 'emerald' },
              { label: 'Total Calls', value: `${(stats.total_calls / 1000000).toFixed(1)}M`, change: '+22.1%', trend: 'up', icon: Phone, color: 'orange' },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    metric.color === 'brand' && 'bg-brand-500/10',
                    metric.color === 'purple' && 'bg-purple-500/10',
                    metric.color === 'emerald' && 'bg-emerald-500/10',
                    metric.color === 'orange' && 'bg-orange-500/10',
                  )}>
                    <metric.icon size={20} className={cn(
                      metric.color === 'brand' && 'text-brand-400',
                      metric.color === 'purple' && 'text-purple-400',
                      metric.color === 'emerald' && 'text-emerald-400',
                      metric.color === 'orange' && 'text-orange-400',
                    )} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    <TrendingUp size={12} />
                    {metric.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-sm text-slate-500 mt-1">{metric.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue & Users Growth */}
            <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
              <h3 className="font-semibold text-white mb-6">Revenue & User Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMRR)" />
                    <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
              <h3 className="font-semibold text-white mb-6">Plan Distribution</h3>
              <div className="flex items-center gap-8">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PLAN_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {PLAN_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {PLAN_DISTRIBUTION.map((plan) => (
                    <div key={plan.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                        <span className="text-sm text-slate-400">{plan.name}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{plan.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Country Stats & Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Countries */}
            <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
              <h3 className="font-semibold text-white mb-4">Top Countries</h3>
              <div className="space-y-3">
                {COUNTRY_STATS.map((country) => (
                  <div key={country.country} className="flex items-center justify-between p-3 rounded-xl bg-surface-900/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{country.country}</p>
                        <p className="text-xs text-slate-500">{country.users} users</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-emerald-400">${country.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Calls by Hour */}
            <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
              <h3 className="font-semibold text-white mb-4">Calls Distribution (24h)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CALLS_BY_HOUR}>
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users, companies, emails..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.05] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
              />
            </div>
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.05] text-white focus:outline-none focus:border-brand-500/50"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.05] text-white focus:outline-none focus:border-brand-500/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Calls</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">MRR</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Last Active</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {user.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.full_name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-white">{user.company}</p>
                          <p className="text-xs text-slate-600">{user.tenant_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                          user.plan === 'enterprise' && 'bg-emerald-500/10 text-emerald-400',
                          user.plan === 'growth' && 'bg-purple-500/10 text-purple-400',
                          user.plan === 'starter' && 'bg-brand-500/10 text-brand-400',
                          user.plan === 'free' && 'bg-slate-500/10 text-slate-400',
                        )}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit',
                          user.status === 'active' && 'bg-emerald-500/10 text-emerald-400',
                          user.status === 'inactive' && 'bg-yellow-500/10 text-yellow-400',
                          user.status === 'suspended' && 'bg-red-500/10 text-red-400',
                        )}>
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            user.status === 'active' && 'bg-emerald-400',
                            user.status === 'inactive' && 'bg-yellow-400',
                            user.status === 'suspended' && 'bg-red-400',
                          )} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {user.calls_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-emerald-400">
                        ${user.mrr}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.last_active}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-white transition-colors">
                            <Eye size={14} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-white transition-colors">
                            <Mail size={14} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                            <Ban size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-white/[0.05] flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-surface-700 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-surface-700 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'MRR', value: `$${stats.mrr.toLocaleString()}`, subtext: 'Monthly Recurring Revenue' },
              { label: 'ARR', value: `$${stats.arr.toLocaleString()}`, subtext: 'Annual Recurring Revenue' },
              { label: 'ARPU', value: '$107', subtext: 'Avg Revenue Per User' },
              { label: 'Churn Rate', value: '2.3%', subtext: 'Monthly churn' },
            ].map((metric) => (
              <div key={metric.label} className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                <p className="text-xs text-slate-600 mt-1">{metric.subtext}</p>
              </div>
            ))}
          </div>

          {/* Revenue by Plan */}
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
            <h3 className="font-semibold text-white mb-6">Revenue by Plan</h3>
            <div className="space-y-4">
              {[
                { plan: 'Enterprise', users: 32, mrr: 31968, percentage: 66 },
                { plan: 'Growth', users: 82, mrr: 16318, percentage: 33 },
                { plan: 'Starter', users: 137, mrr: 6713, percentage: 14 },
                { plan: 'Free', users: 205, mrr: 0, percentage: 0 },
              ].map((item) => (
                <div key={item.plan}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-white">{item.plan}</span>
                      <span className="text-xs text-slate-500">{item.users} users</span>
                    </div>
                    <span className="font-medium text-white">${item.mrr.toLocaleString()}/mo</span>
                  </div>
                  <div className="w-full bg-surface-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* System Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Avg Response Time', value: `${stats.avg_response_time}ms`, status: 'good', icon: Zap },
              { label: 'Success Rate', value: `${stats.success_rate}%`, status: 'good', icon: CheckCircle },
              { label: 'API Uptime', value: '99.98%', status: 'good', icon: Activity },
              { label: 'Active Connections', value: '1,247', status: 'good', icon: Globe },
            ].map((metric) => (
              <div key={metric.label} className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
                <div className="flex items-center justify-between mb-3">
                  <metric.icon size={20} className="text-emerald-400" />
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                    Healthy
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-sm text-slate-500 mt-1">{metric.label}</p>
              </div>
            ))}
          </div>

          {/* Services Status */}
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
            <h3 className="font-semibold text-white mb-4">Service Status</h3>
            <div className="space-y-3">
              {[
                { service: 'Voice API', status: 'operational', latency: '45ms' },
                { service: 'RAG Engine', status: 'operational', latency: '32ms' },
                { service: 'Database (PostgreSQL)', status: 'operational', latency: '12ms' },
                { service: 'Redis Cache', status: 'operational', latency: '2ms' },
                { service: 'Twilio Integration', status: 'operational', latency: '89ms' },
                { service: 'OpenAI API', status: 'operational', latency: '234ms' },
                { service: 'Stripe Payments', status: 'operational', latency: '156ms' },
                { service: 'Cashfree Payments', status: 'operational', latency: '178ms' },
              ].map((item) => (
                <div key={item.service} className="flex items-center justify-between p-3 rounded-xl bg-surface-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-white">{item.service}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">{item.latency}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 capitalize">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
