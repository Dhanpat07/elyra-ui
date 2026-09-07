/**
 * Billing Page - LAALI Voice AI Platform
 * Connected to Supabase for real data
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Check,
  AlertTriangle,
  Download,
  TrendingUp,
  Zap,
  ChevronRight,
  Sparkles,
  Shield,
  Headphones,
  Database,
  Users,
  Crown,
  Receipt,
  Plus,
  IndianRupee,
  Eye,
  Loader2,
  Phone,
  Bot,
} from 'lucide-react';
import { cn } from '../lib';
import { InvoicePreview, type InvoiceData } from '../components/Invoice';
import { useInvoices, useUsage } from '../hooks/useSupabase';
import type { Invoice } from '../hooks/useSupabase';
import { useAuthContext } from '../contexts/AuthContext';

// Plans Data
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out LAALI',
    priceINR: { monthly: 0, yearly: 0 },
    features: ['100 voice minutes/month', '1 AI agent', 'Basic analytics', 'Community support'],
    limits: { voiceMinutes: 100, agents: 1 },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small businesses',
    priceINR: { monthly: 2399, yearly: 23990 },
    features: ['1,000 voice minutes/month', '3 AI agents', 'Advanced analytics', 'Email support', 'Custom voice'],
    limits: { voiceMinutes: 1000, agents: 3 },
    popular: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing teams',
    priceINR: { monthly: 7999, yearly: 79990 },
    features: ['5,000 voice minutes/month', '10 AI agents', 'Priority support', 'API access', 'Custom integrations'],
    limits: { voiceMinutes: 5000, agents: 10 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    priceINR: { monthly: 39999, yearly: 399990 },
    features: ['Unlimited minutes', 'Unlimited agents', '24/7 phone support', 'Dedicated manager', 'SLA guarantee', 'On-premise option'],
    limits: { voiceMinutes: -1, agents: -1 },
    enterprise: true,
  },
];

export default function BillingPage() {
  const { organization } = useAuthContext();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { usage, loading: usageLoading } = useUsage();
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'plans' | 'usage' | 'invoices' | 'payment'>('plans');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  
  const currentPlan = PLANS.find(p => p.id === (organization?.plan || 'free')) || PLANS[0];

  // Format currency
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Convert Invoice to InvoiceData for preview
  const convertToInvoiceData = (invoice: Invoice): InvoiceData => ({
    invoiceNumber: invoice.invoice_number,
    date: invoice.created_at,
    dueDate: invoice.due_date || invoice.created_at,
    customer: {
      name: organization?.name || 'Customer',
      email: '',
      address: invoice.billing_address ? Object.values(invoice.billing_address).join(', ') : '',
      gstin: invoice.gstin,
    },
    items: invoice.line_items || [
      { description: `${currentPlan.name} Plan - Monthly`, quantity: 1, unitPrice: invoice.subtotal / 100, amount: invoice.subtotal / 100 }
    ],
    subtotal: invoice.subtotal / 100,
    tax: invoice.tax_amount / 100,
    taxRate: invoice.tax_rate,
    discount: invoice.discount_amount / 100,
    total: invoice.total / 100,
    currency: invoice.currency,
    status: invoice.status,
    notes: 'Thank you for choosing LAALI AI!',
  });

  const loading = invoicesLoading || usageLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Billing & Usage</h2>
          <p className="text-slate-500 mt-1">
            Current Plan: <span className="text-gold-400 font-medium">{currentPlan.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-800 rounded-xl p-1">
          {(['plans', 'usage', 'invoices', 'payment'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                activeTab === tab
                  ? 'bg-gold-500 text-surface-900'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm", billingCycle === 'monthly' ? 'text-white' : 'text-slate-500')}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                billingCycle === 'yearly' ? 'bg-gold-500' : 'bg-surface-700'
              )}
            >
              <div className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white transition-all",
                billingCycle === 'yearly' ? 'left-8' : 'left-1'
              )} />
            </button>
            <span className={cn("text-sm", billingCycle === 'yearly' ? 'text-white' : 'text-slate-500')}>
              Yearly <span className="text-emerald-400 text-xs ml-1">Save 17%</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative bg-surface-800 rounded-2xl border p-5 transition-all",
                  plan.popular ? "border-gold-500/50 ring-1 ring-gold-500/20" : "border-white/[0.05]",
                  currentPlan.id === plan.id && "ring-2 ring-gold-500"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold-500 rounded-full text-xs font-medium text-surface-900">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-1">
                    <IndianRupee className="w-5 h-5 text-gold-400" />
                    <span className="text-3xl font-bold text-white">
                      {plan.priceINR[billingCycle].toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={cn(
                    "w-full py-2.5 rounded-xl font-medium text-sm transition-all",
                    currentPlan.id === plan.id
                      ? "bg-surface-700 text-slate-400 cursor-default"
                      : plan.enterprise
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
                        : "bg-gold-500 text-surface-900 hover:bg-gold-400"
                  )}
                  disabled={currentPlan.id === plan.id}
                >
                  {currentPlan.id === plan.id ? 'Current Plan' : plan.enterprise ? 'Contact Sales' : 'Upgrade'}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {usageLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Voice Minutes */}
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Voice Minutes</h3>
                    <p className="text-sm text-slate-500">
                      {usage?.minutesUsed || 0} / {usage?.minutesTotal || currentPlan.limits.voiceMinutes} used
                    </p>
                  </div>
                </div>
                <div className="w-full h-3 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      ((usage?.minutesUsed || 0) / (usage?.minutesTotal || 1)) > 0.9 ? "bg-red-500" :
                      ((usage?.minutesUsed || 0) / (usage?.minutesTotal || 1)) > 0.7 ? "bg-amber-500" : "bg-gold-500"
                    )}
                    style={{ width: `${Math.min(100, ((usage?.minutesUsed || 0) / (usage?.minutesTotal || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {Math.round(((usage?.minutesUsed || 0) / (usage?.minutesTotal || 1)) * 100)}% of monthly limit
                </p>
              </div>

              {/* Agents */}
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Agents</h3>
                    <p className="text-sm text-slate-500">
                      {usage?.agentsUsed || 0} / {usage?.agentsTotal || currentPlan.limits.agents} active
                    </p>
                  </div>
                </div>
                <div className="w-full h-3 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${((usage?.agentsUsed || 0) / (usage?.agentsTotal || 1)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {usage?.agentsTotal ? usage.agentsTotal - (usage?.agentsUsed || 0) : currentPlan.limits.agents} slots remaining
                </p>
              </div>

              {/* API Calls */}
              <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">API Calls</h3>
                    <p className="text-sm text-slate-500">
                      {(usage?.apiCallsUsed || 0).toLocaleString()} / {(usage?.apiCallsTotal || 10000).toLocaleString()} used
                    </p>
                  </div>
                </div>
                <div className="w-full h-3 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${((usage?.apiCallsUsed || 0) / (usage?.apiCallsTotal || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Cost Estimate */}
              <div className="bg-gradient-to-br from-gold-500/10 to-amber-500/5 rounded-2xl border border-gold-500/20 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">This Month</h3>
                    <p className="text-sm text-slate-500">Based on current usage</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatINR(currentPlan.priceINR.monthly)}
                </div>
                <p className="text-xs text-gold-400 mt-1">
                  Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] overflow-hidden">
            <div className="p-4 border-b border-white/[0.05]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gold-400" />
                Invoice History
              </h3>
            </div>
            
            {invoicesLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-8 text-center">
                <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No invoices yet</p>
                <p className="text-sm text-slate-500">Your invoices will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{invoice.invoice_number}</div>
                        <div className="text-sm text-slate-500">{formatDate(invoice.created_at)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-white">{formatINR(invoice.total / 100)}</div>
                        <div className={cn(
                          "text-xs font-medium capitalize",
                          invoice.status === 'paid' && "text-emerald-400",
                          invoice.status === 'pending' && "text-amber-400",
                          invoice.status === 'overdue' && "text-red-400",
                        )}>
                          {invoice.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(convertToInvoiceData(invoice))}
                          className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors">
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold-400" />
              Payment Methods
            </h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-white/[0.1] bg-surface-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <div className="text-white font-medium">•••• •••• •••• 4242</div>
                    <div className="text-xs text-slate-500">Expires 12/25</div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Default</span>
              </div>

              <button className="w-full p-4 rounded-xl border border-dashed border-white/[0.1] text-slate-400 hover:text-white hover:border-white/[0.2] transition-all flex items-center justify-center gap-2">
                <Plus size={18} />
                Add Payment Method
              </button>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gold-500/10 border border-gold-500/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gold-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Secure Payments</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    We support UPI, Credit/Debit Cards, and Net Banking via Cashfree for Indian customers.
                    International payments processed securely via Stripe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <InvoicePreview
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
