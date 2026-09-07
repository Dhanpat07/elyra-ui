import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Key,
  Webhook,
  Bell,
  Shield,
  Users,
  Camera,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  ChevronRight,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { cn } from '../lib';

type SettingsTab = 'profile' | 'organization' | 'team' | 'api' | 'webhooks' | 'notifications' | 'security';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  status: 'active' | 'pending';
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'disabled';
  lastTriggered?: string;
}

const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@company.com', role: 'owner', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'admin', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'member', status: 'active' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@company.com', role: 'member', status: 'pending' },
];

const MOCK_API_KEYS: ApiKey[] = [
  { id: '1', name: 'Production', key: 'elyra_prod_sk_1234567890abcdef', created: '2024-01-15', lastUsed: '2 hours ago' },
  { id: '2', name: 'Development', key: 'elyra_dev_sk_0987654321fedcba', created: '2024-02-01', lastUsed: '1 day ago' },
];

const WEBHOOK_EVENTS = [
  'call.started',
  'call.ended',
  'call.failed',
  'agent.updated',
  'usage.threshold',
];

export function SettingsPage() {
  const { profile, updateProfile } = useAuthContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [orgName, setOrgName] = useState('Acme Inc');
  const [website, setWebsite] = useState('https://acme.com');
  const [industry, setIndustry] = useState('Technology');
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email_usage: true,
    email_billing: true,
    email_marketing: false,
    push_calls: true,
    push_alerts: true,
  });

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: fullName, phone });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-surface-800 rounded-2xl border border-white/[0.05] p-2 lg:sticky lg:top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Profile Settings</h3>
                
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                      {fullName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-surface-700 border border-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <p className="font-medium text-white">{fullName || 'Your Name'}</p>
                    <p className="text-sm text-slate-500">{email}</p>
                    <p className="text-xs text-slate-600 mt-1">Member since Jan 2024</p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-900 border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-900 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                    <input
                      type="text"
                      value={profile?.role || 'Member'}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-white/[0.05] text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Organization */}
          {activeTab === 'organization' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Organization Settings</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Tenant ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profile?.tenant_id || 'demo'}
                        disabled
                        className="flex-1 px-4 py-3 rounded-xl bg-surface-900/50 border border-white/[0.05] text-slate-500 cursor-not-allowed font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(profile?.tenant_id || 'demo', 'tenant')}
                        className="px-3 rounded-xl bg-surface-700 border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedKey === 'tenant' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Website</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-900 border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/50 transition-all"
                    >
                      <option value="Technology">Technology</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Team Members</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{MOCK_TEAM.length} members</p>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all flex items-center gap-2">
                    <Plus size={16} />
                    Invite Member
                  </button>
                </div>

                <div className="space-y-3">
                  {MOCK_TEAM.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-white/[0.03]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          member.role === 'owner' && 'bg-purple-500/10 text-purple-400',
                          member.role === 'admin' && 'bg-brand-500/10 text-brand-400',
                          member.role === 'member' && 'bg-slate-500/10 text-slate-400',
                        )}>
                          {member.role}
                        </span>
                        {member.status === 'pending' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                            Pending
                          </span>
                        )}
                        {member.role !== 'owner' && (
                          <button className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">API Keys</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your API access</p>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all flex items-center gap-2">
                    <Plus size={16} />
                    Create Key
                  </button>
                </div>

                <div className="space-y-3">
                  {MOCK_API_KEYS.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="p-4 rounded-xl bg-surface-900/50 border border-white/[0.03]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                            <Key size={18} className="text-brand-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{apiKey.name}</p>
                            <p className="text-xs text-slate-500">Created {apiKey.created}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                            className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-white transition-colors"
                          >
                            {showApiKey === apiKey.id ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                            className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-white transition-colors"
                          >
                            {copiedKey === apiKey.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                          <button className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 rounded-lg bg-surface-950 text-sm font-mono text-slate-400 overflow-hidden text-ellipsis">
                          {showApiKey === apiKey.id ? apiKey.key : '•'.repeat(40)}
                        </code>
                      </div>
                      {apiKey.lastUsed && (
                        <p className="text-xs text-slate-600 mt-2">Last used: {apiKey.lastUsed}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* API Docs Link */}
                <div className="mt-6 p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">API Documentation</p>
                      <p className="text-sm text-slate-500 mt-0.5">Learn how to integrate Elyra into your app</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-brand-600/20 text-brand-400 text-sm font-medium hover:bg-brand-600/30 transition-colors flex items-center gap-2">
                      View Docs <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Webhooks */}
          {activeTab === 'webhooks' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Webhooks</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Receive real-time notifications</p>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all flex items-center gap-2">
                    <Plus size={16} />
                    Add Webhook
                  </button>
                </div>

                {/* Available Events */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-400 mb-3">Available Events</p>
                  <div className="flex flex-wrap gap-2">
                    {WEBHOOK_EVENTS.map((event) => (
                      <span
                        key={event}
                        className="px-3 py-1.5 rounded-lg bg-surface-900 border border-white/[0.05] text-sm text-slate-400"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center py-12 border-2 border-dashed border-white/[0.08] rounded-xl">
                  <Webhook size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No webhooks configured</p>
                  <p className="text-sm text-slate-600">Add a webhook to receive event notifications</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-4">Email Notifications</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'email_usage', label: 'Usage alerts', desc: 'Get notified when approaching limits' },
                        { key: 'email_billing', label: 'Billing updates', desc: 'Invoices, payment reminders' },
                        { key: 'email_marketing', label: 'Product updates', desc: 'New features and tips' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                            className={cn(
                              'w-12 h-6 rounded-full transition-colors relative',
                              notifications[item.key as keyof typeof notifications]
                                ? 'bg-brand-600'
                                : 'bg-surface-700'
                            )}
                          >
                            <div className={cn(
                              'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                              notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.05]" />

                  {/* Push Notifications */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-4">Push Notifications</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'push_calls', label: 'Call activity', desc: 'Real-time call notifications' },
                        { key: 'push_alerts', label: 'System alerts', desc: 'Downtime and critical issues' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                            className={cn(
                              'w-12 h-6 rounded-full transition-colors relative',
                              notifications[item.key as keyof typeof notifications]
                                ? 'bg-brand-600'
                                : 'bg-surface-700'
                            )}
                          >
                            <div className={cn(
                              'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                              notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Security Settings</h3>

                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="p-4 rounded-xl bg-surface-900/50 border border-white/[0.03] flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Change Password</p>
                      <p className="text-sm text-slate-500">Update your account password</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-surface-700 text-white text-sm hover:bg-surface-600 transition-colors">
                      Update
                    </button>
                  </div>

                  {/* Two-Factor Auth */}
                  <div className="p-4 rounded-xl bg-surface-900/50 border border-white/[0.03] flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-500 transition-colors">
                      Enable
                    </button>
                  </div>

                  {/* Sessions */}
                  <div className="p-4 rounded-xl bg-surface-900/50 border border-white/[0.03] flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Active Sessions</p>
                      <p className="text-sm text-slate-500">Manage your logged-in devices</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-surface-700 text-white text-sm hover:bg-surface-600 transition-colors flex items-center gap-2">
                      View <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/5 rounded-2xl border border-red-500/20 p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Delete Account</p>
                    <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
