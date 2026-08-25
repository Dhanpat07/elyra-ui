import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  AlertTriangle,
  Download,
  Bell,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface Plan {
  name: string;
  display_name: string;
  pricing: { monthly: number; yearly: number };
  limits: {
    requests_per_month: number;
    llm_tokens_per_month: number;
    voice_minutes_per_month: number;
    concurrent_calls: number;
    storage_mb: number;
  };
  features: string[];
  recommended: boolean;
}

interface UsageData {
  tenant_id: string;
  plan: string;
  usage: {
    requests: { day: { used: number; limit: number }; month: { used: number; limit: number } };
    llm_tokens: { day: { used: number; limit: number }; month: { used: number; limit: number } };
    voice_minutes: { month: { used: number; limit: number } };
  };
  costs: { today: number; month: number; limits: { daily: number; monthly: number } };
  percentages: { [key: string]: number };
}

interface Invoice {
  id: string;
  number?: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const API_BASE = 'http://localhost:8001';

export default function BillingPage() {
  const [tenantId] = useState('demo');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'usage' | 'invoices' | 'notifications'>('plans');

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pricingRes, usageRes, invoicesRes, notificationsRes] = await Promise.all([
        fetch(`${API_BASE}/billing/pricing`),
        fetch(`${API_BASE}/usage/${tenantId}`),
        fetch(`${API_BASE}/billing/invoices/${tenantId}`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/billing/notifications/${tenantId}`).catch(() => ({ ok: false })),
      ]);

      if (pricingRes.ok) {
        const data = await pricingRes.json();
        setPlans(data.plans);
      }

      if (usageRes.ok) {
        const data = await usageRes.json();
        setUsage(data);
        setCurrentPlan(data.plan);
      }

      if (invoicesRes.ok) {
        const data = await (invoicesRes as Response).json();
        setInvoices(data.invoices || []);
      }

      if (notificationsRes.ok) {
        const data = await (notificationsRes as Response).json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (planName === currentPlan) return;
    
    setUpgradeLoading(planName);
    try {
      // First ensure customer exists
      await fetch(`${API_BASE}/billing/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          email: `${tenantId}@example.com`,
          name: tenantId,
        }),
      });

      // Then create/change subscription
      const endpoint = currentPlan === 'free' 
        ? `${API_BASE}/billing/subscriptions`
        : `${API_BASE}/billing/subscriptions/change-plan`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          plan: planName,
          new_plan: planName,
          billing_cycle: billingCycle,
        }),
      });

      if (response.ok) {
        setCurrentPlan(planName);
        loadData();
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setUpgradeLoading(null);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription, monitor usage, and view invoices.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'plans', label: 'Plans', icon: Zap },
            { id: 'usage', label: 'Usage', icon: TrendingUp },
            { id: 'invoices', label: 'Invoices', icon: CreditCard },
            { id: 'notifications', label: 'Alerts', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div>
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly <span className="text-green-600 text-xs">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const price = plan.pricing[billingCycle];
              const isCurrentPlan = currentPlan === plan.name;
              
              return (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all ${
                    plan.recommended
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-20'
                      : isCurrentPlan
                      ? 'border-green-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.display_name}</h3>
                    
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">${price}</span>
                      <span className="ml-1 text-gray-500">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {plan.features.slice(0, 6).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={isCurrentPlan || upgradeLoading !== null}
                      className={`mt-6 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : plan.recommended
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {upgradeLoading === plan.name ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : currentPlan === 'free' || plans.findIndex(p => p.name === plan.name) > plans.findIndex(p => p.name === currentPlan) ? (
                        'Upgrade'
                      ) : (
                        'Downgrade'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && usage && (
        <div className="space-y-6">
          {/* Usage Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'API Requests',
                used: usage.usage.requests.month.used,
                limit: usage.usage.requests.month.limit,
                percentage: usage.percentages.requests_monthly,
                icon: Zap,
              },
              {
                label: 'LLM Tokens',
                used: usage.usage.llm_tokens.month.used,
                limit: usage.usage.llm_tokens.month.limit,
                percentage: usage.percentages.tokens_monthly,
                icon: TrendingUp,
              },
              {
                label: 'Voice Minutes',
                used: usage.usage.voice_minutes.month.used,
                limit: usage.usage.voice_minutes.month.limit,
                percentage: (usage.usage.voice_minutes.month.used / usage.usage.voice_minutes.month.limit) * 100,
                icon: Clock,
              },
              {
                label: 'Monthly Cost',
                used: usage.costs.month,
                limit: usage.costs.limits.monthly,
                percentage: usage.percentages.cost_monthly,
                icon: CreditCard,
                isCurrency: true,
              },
            ].map((metric, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                  <metric.icon className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.isCurrency ? `$${metric.used.toFixed(2)}` : formatNumber(metric.used)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {' / '}
                    {metric.isCurrency ? `$${metric.limit}` : formatNumber(metric.limit)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      metric.percentage >= 90
                        ? 'bg-red-500'
                        : metric.percentage >= 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  {metric.percentage.toFixed(1)}% used
                </p>
              </div>
            ))}
          </div>

          {/* Usage Alerts */}
          {usage.percentages.requests_monthly >= 80 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Usage Warning</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You've used {usage.percentages.requests_monthly.toFixed(0)}% of your monthly requests.
                  Consider upgrading to avoid service interruption.
                </p>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="text-sm font-medium text-yellow-800 hover:text-yellow-900 mt-2 inline-flex items-center gap-1"
                >
                  View Plans <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Invoice History</h3>
          </div>
          
          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No invoices yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Invoices will appear here after your first payment
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.number || invoice.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invoice.created)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.invoice_pdf && (
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Alerts & Notifications</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications</p>
              <p className="text-sm text-gray-400 mt-1">
                You'll receive alerts about usage limits and billing events
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      notification.type.includes('warning') ? 'bg-yellow-100' :
                      notification.type.includes('limit') || notification.type.includes('failed') ? 'bg-red-100' :
                      'bg-green-100'
                    }`}>
                      {notification.type.includes('warning') ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      ) : notification.type.includes('limit') || notification.type.includes('failed') ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
