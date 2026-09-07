import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Plus, Trash2, CreditCard, Building2,
  Globe, Mic, CheckCircle, AlertCircle,
  Search, ChevronRight, Sparkles, Shield,
  Zap, Users, TrendingUp, IndianRupee, Clock
} from 'lucide-react'
import { cn } from '../lib'
import { useStore } from '../store'

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface PhoneNumber {
  phone_number: string
  friendly_name: string
  number_type: string
  region: string
  status: string
  created_at: string
  monthly_cost: number
}

interface AvailableNumber {
  phone_number: string
  type: string
  region: string
  monthly_cost: number
  features: string[]
}

interface TenantConfig {
  tenant_id: string
  tenant_name: string
  phone_numbers: string[]
  default_persona: string
  default_language: string
  greeting: string
  brand_name: string
  plan: string
  max_numbers: number
  max_concurrent_calls: number
}

interface Plan {
  id: string
  name: string
  price: number
  numbers: number
  concurrent: number
  features: string[]
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4999,
    numbers: 2,
    concurrent: 10,
    features: [
      '2 Elyra phone numbers',
      '10 concurrent calls',
      'Basic AI persona',
      'Email support',
      '1,000 minutes/month included',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 14999,
    numbers: 10,
    concurrent: 50,
    popular: true,
    features: [
      '10 Elyra phone numbers',
      '50 concurrent calls',
      'Custom AI personas',
      'Priority support',
      '5,000 minutes/month included',
      'RAG integration',
      'Analytics dashboard',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49999,
    numbers: 100,
    concurrent: 500,
    features: [
      'Unlimited phone numbers',
      '500+ concurrent calls',
      'White-label AI personas',
      '24/7 dedicated support',
      'Unlimited minutes',
      'Custom RAG training',
      'SLA guarantee',
      'On-premise option',
    ],
  },
]

const PERSONAS = [
  { id: 'aria', name: 'Aria', description: 'Friendly & professional', language: 'en' },
  { id: 'priya', name: 'Priya', description: 'Warm Hindi assistant', language: 'hi' },
  { id: 'raj', name: 'Raj', description: 'Professional Hindi male', language: 'hi' },
  { id: 'maya', name: 'Maya', description: 'Bilingual expert', language: 'hi-en' },
  { id: 'custom', name: 'Custom', description: 'Build your own persona', language: 'any' },
]

// ─────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────

function PlanCard({ plan, selected, onSelect }: { 
  plan: Plan
  selected: boolean
  onSelect: () => void 
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className={cn(
        'relative p-6 rounded-2xl border-2 cursor-pointer transition-all',
        selected 
          ? 'border-brand-500 bg-brand-500/10' 
          : 'border-white/10 bg-surface-800/50 hover:border-white/20',
        plan.popular && 'ring-2 ring-brand-500/50'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-full">
          Most Popular
        </div>
      )}
      
      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
      
      <div className="mt-4 flex items-baseline gap-1">
        <IndianRupee size={20} className="text-slate-400" />
        <span className="text-3xl font-bold text-white">{plan.price.toLocaleString()}</span>
        <span className="text-slate-500">/month</span>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} className="text-brand-400" />
          <span className="text-slate-300">{plan.numbers} phone numbers</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users size={14} className="text-brand-400" />
          <span className="text-slate-300">{plan.concurrent} concurrent calls</span>
        </div>
      </div>
      
      <ul className="mt-4 space-y-2">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      {selected && (
        <div className="absolute top-4 right-4">
          <CheckCircle size={24} className="text-brand-400" />
        </div>
      )}
    </motion.div>
  )
}

function NumberCard({ number, onRemove }: { 
  number: PhoneNumber
  onRemove: () => void 
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-800/50 rounded-xl border border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
          <Phone size={18} className="text-brand-400" />
        </div>
        <div>
          <p className="font-mono font-medium text-white">{number.phone_number}</p>
          <p className="text-xs text-slate-500">
            {number.friendly_name || number.region} · {number.number_type}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-white">₹{number.monthly_cost}/mo</p>
          <p className={cn(
            'text-xs',
            number.status === 'active' ? 'text-emerald-400' : 'text-yellow-400'
          )}>
            {number.status}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

function AvailableNumberCard({ number, onSelect }: {
  number: AvailableNumber
  onSelect: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-4 bg-surface-800/30 rounded-xl border border-white/5 hover:border-brand-500/30 transition cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Plus size={18} className="text-emerald-400" />
        </div>
        <div>
          <p className="font-mono font-medium text-white">{number.phone_number}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-2 py-0.5 bg-surface-700 rounded text-slate-400">
              {number.type}
            </span>
            <span className="text-xs text-slate-500">{number.region}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">₹{number.monthly_cost}/mo</p>
        <p className="text-xs text-emerald-400">Available</p>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────

export function TenantPortalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'numbers' | 'config' | 'billing'>('overview')
  const [selectedPlan, setSelectedPlan] = useState('growth')
  const [config, setConfig] = useState<TenantConfig | null>(null)
  const [myNumbers, setMyNumbers] = useState<PhoneNumber[]>([])
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [searchType, setSearchType] = useState('mobile')
  const [searchRegion, setSearchRegion] = useState('')

  const API_BASE = import.meta.env.VITE_VOICE_API_URL || 'http://localhost:8000'
  const tenantId = 'demo'

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tenant config
        const configRes = await fetch(`${API_BASE}/phone/tenant/${tenantId}/config`)
        if (configRes.ok) {
          setConfig(await configRes.json())
        }

        // Fetch my numbers
        const numbersRes = await fetch(`${API_BASE}/phone/tenant/${tenantId}/numbers`)
        if (numbersRes.ok) {
          const data = await numbersRes.json()
          setMyNumbers(data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantId])

  // Search available numbers
  const searchNumbers = async () => {
    try {
      const res = await fetch(`${API_BASE}/phone/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: 'IN',
          number_type: searchType,
          region: searchRegion || undefined,
          limit: 10,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Add some mock features for display
        setAvailableNumbers(data.map((n: any) => ({
          ...n,
          features: ['Voice', 'SMS', 'AI Ready'],
        })))
      }
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  // Buy number
  const buyNumber = async (number: AvailableNumber) => {
    try {
      const res = await fetch(`${API_BASE}/phone/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: number.phone_number,
          tenant_id: tenantId,
          provider: 'elyra', // White-label - always "elyra"
          number_type: number.type,
          country: 'IN',
          friendly_name: `${config?.brand_name || tenantId} - ${number.region}`,
        }),
      })

      if (res.ok) {
        // Refresh numbers
        const numbersRes = await fetch(`${API_BASE}/phone/tenant/${tenantId}/numbers`)
        if (numbersRes.ok) {
          setMyNumbers(await numbersRes.json())
        }
        setShowBuyModal(false)
      }
    } catch (err) {
      console.error('Buy error:', err)
    }
  }

  // Release number
  const releaseNumber = async (phoneNumber: string) => {
    if (!confirm('Are you sure you want to release this number? This action cannot be undone.')) {
      return
    }

    try {
      await fetch(`${API_BASE}/phone/${encodeURIComponent(phoneNumber)}`, {
        method: 'DELETE',
      })

      setMyNumbers(myNumbers.filter(n => n.phone_number !== phoneNumber))
    } catch (err) {
      console.error('Release error:', err)
    }
  }

  // Save config
  const saveConfig = async (updates: Partial<TenantConfig>) => {
    try {
      const res = await fetch(`${API_BASE}/phone/tenant/${tenantId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_name: config?.tenant_name || tenantId,
          ...updates,
        }),
      })

      if (res.ok) {
        setConfig(await res.json())
      }
    } catch (err) {
      console.error('Save error:', err)
    }
  }

  const currentPlan = PLANS.find(p => p.id === (config?.plan || 'growth'))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="text-brand-400" />
            {config?.brand_name || 'Your Business'}
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your Elyra Voice AI platform
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-800 rounded-xl">
          <Sparkles size={16} className="text-brand-400" />
          <span className="text-sm font-medium text-white">{currentPlan?.name} Plan</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface-800/50 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Phone size={14} />
            <span>Phone Numbers</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {myNumbers.length}
            <span className="text-sm font-normal text-slate-500">/{currentPlan?.numbers || 10}</span>
          </p>
        </div>
        <div className="p-4 bg-surface-800/50 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Users size={14} />
            <span>Concurrent Calls</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            0
            <span className="text-sm font-normal text-slate-500">/{currentPlan?.concurrent || 50}</span>
          </p>
        </div>
        <div className="p-4 bg-surface-800/50 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Clock size={14} />
            <span>Minutes Used</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">0</p>
        </div>
        <div className="p-4 bg-surface-800/50 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <TrendingUp size={14} />
            <span>Calls Today</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">0</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-800/50 rounded-xl w-fit">
        {(['overview', 'numbers', 'config', 'billing'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition',
              activeTab === tab
                ? 'bg-brand-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('numbers')}
                className="p-6 bg-surface-800/50 rounded-xl border border-white/5 hover:border-brand-500/30 transition text-left group"
              >
                <Phone size={24} className="text-brand-400 mb-3" />
                <h3 className="font-semibold text-white group-hover:text-brand-400 transition">
                  Get Phone Numbers
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Add Elyra phone numbers for your customers to call
                </p>
                <ChevronRight size={16} className="text-slate-500 mt-3 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className="p-6 bg-surface-800/50 rounded-xl border border-white/5 hover:border-brand-500/30 transition text-left group"
              >
                <Mic size={24} className="text-purple-400 mb-3" />
                <h3 className="font-semibold text-white group-hover:text-purple-400 transition">
                  Configure AI Voice
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Customize your AI assistant's personality and voice
                </p>
                <ChevronRight size={16} className="text-slate-500 mt-3 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                className="p-6 bg-surface-800/50 rounded-xl border border-white/5 hover:border-brand-500/30 transition text-left group"
              >
                <CreditCard size={24} className="text-emerald-400 mb-3" />
                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition">
                  Upgrade Plan
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Get more numbers and concurrent call capacity
                </p>
                <ChevronRight size={16} className="text-slate-500 mt-3 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* My Numbers Preview */}
            <div className="bg-surface-800/30 rounded-xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">Your Elyra Numbers</h2>
                <button
                  onClick={() => {
                    setActiveTab('numbers')
                    setShowBuyModal(true)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-500 text-white text-sm rounded-lg hover:bg-brand-600 transition"
                >
                  <Plus size={14} />
                  Add Number
                </button>
              </div>

              {myNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <Phone size={48} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-400">No phone numbers yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Get your first Elyra number to start receiving AI-powered calls
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNumbers.slice(0, 3).map(number => (
                    <NumberCard
                      key={number.phone_number}
                      number={number}
                      onRemove={() => releaseNumber(number.phone_number)}
                    />
                  ))}
                  {myNumbers.length > 3 && (
                    <button
                      onClick={() => setActiveTab('numbers')}
                      className="w-full py-2 text-sm text-brand-400 hover:text-brand-300 transition"
                    >
                      View all {myNumbers.length} numbers →
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'numbers' && (
          <motion.div
            key="numbers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* My Numbers */}
            <div className="bg-surface-800/30 rounded-xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">Your Elyra Numbers</h2>
                <button
                  onClick={() => {
                    setShowBuyModal(true)
                    searchNumbers()
                  }}
                  disabled={myNumbers.length >= (currentPlan?.numbers || 10)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition',
                    myNumbers.length >= (currentPlan?.numbers || 10)
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-brand-500 text-white hover:bg-brand-600'
                  )}
                >
                  <Plus size={14} />
                  Get New Number
                </button>
              </div>

              {myNumbers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-brand-500/20 rounded-full flex items-center justify-center mb-4">
                    <Phone size={32} className="text-brand-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Get Your First Number</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">
                    Elyra phone numbers come with AI-powered voice capabilities built in.
                    Your customers can call and get instant, intelligent responses.
                  </p>
                  <button
                    onClick={() => {
                      setShowBuyModal(true)
                      searchNumbers()
                    }}
                    className="mt-6 px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} />
                    Get Your First Number
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNumbers.map(number => (
                    <NumberCard
                      key={number.phone_number}
                      number={number}
                      onRemove={() => releaseNumber(number.phone_number)}
                    />
                  ))}
                </div>
              )}

              {myNumbers.length >= (currentPlan?.numbers || 10) && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="text-yellow-400" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">Number limit reached</p>
                    <p className="text-xs text-yellow-400/70">
                      Upgrade your plan to get more Elyra numbers
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className="ml-auto px-3 py-1.5 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </div>

            {/* Buy Number Modal */}
            <AnimatePresence>
              {showBuyModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowBuyModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-surface-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="p-6 border-b border-white/5">
                      <h2 className="text-xl font-bold text-white">Get Elyra Number</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Choose a phone number for your AI voice assistant
                      </p>
                    </div>

                    <div className="p-6">
                      {/* Search Filters */}
                      <div className="flex gap-3 mb-6">
                        <select
                          value={searchType}
                          onChange={e => setSearchType(e.target.value)}
                          className="px-4 py-2 bg-surface-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                        >
                          <option value="mobile">Mobile Number</option>
                          <option value="toll_free">Toll-Free (1800)</option>
                          <option value="local">Landline</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Region (MH, KA, DL...)"
                          value={searchRegion}
                          onChange={e => setSearchRegion(e.target.value)}
                          className="px-4 py-2 bg-surface-800 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                        />
                        <button
                          onClick={searchNumbers}
                          className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 transition flex items-center gap-2"
                        >
                          <Search size={14} />
                          Search
                        </button>
                      </div>

                      {/* Available Numbers */}
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {availableNumbers.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <Search size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Search for available numbers</p>
                          </div>
                        ) : (
                          availableNumbers.map(number => (
                            <AvailableNumberCard
                              key={number.phone_number}
                              number={number}
                              onSelect={() => buyNumber(number)}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-surface-800/50">
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <Shield size={16} className="text-emerald-400" />
                        <span>All Elyra numbers include AI voice, call recording, and analytics</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Brand Settings */}
            <div className="bg-surface-800/30 rounded-xl border border-white/5 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-brand-400" />
                Brand Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={config?.brand_name || ''}
                    onChange={e => setConfig(c => c ? { ...c, brand_name: e.target.value } : null)}
                    onBlur={() => config && saveConfig({ brand_name: config.brand_name })}
                    placeholder="Your Company Name"
                    className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Welcome Greeting</label>
                  <textarea
                    value={config?.greeting || ''}
                    onChange={e => setConfig(c => c ? { ...c, greeting: e.target.value } : null)}
                    onBlur={() => config && saveConfig({ greeting: config.greeting })}
                    placeholder="Hello! Welcome to [Your Company]. How can I help you today?"
                    rows={3}
                    className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This greeting plays when customers call your Elyra number
                  </p>
                </div>
              </div>
            </div>

            {/* AI Voice Settings */}
            <div className="bg-surface-800/30 rounded-xl border border-white/5 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Mic size={18} className="text-purple-400" />
                AI Voice Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">AI Persona</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERSONAS.map(persona => (
                      <button
                        key={persona.id}
                        onClick={() => {
                          setConfig(c => c ? { ...c, default_persona: persona.id } : null)
                          saveConfig({ default_persona: persona.id })
                        }}
                        className={cn(
                          'p-3 rounded-xl border text-left transition',
                          config?.default_persona === persona.id
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-white/10 hover:border-white/20'
                        )}
                      >
                        <p className="font-medium text-white text-sm">{persona.name}</p>
                        <p className="text-xs text-slate-500">{persona.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Default Language</label>
                  <select
                    value={config?.default_language || 'hi'}
                    onChange={e => {
                      setConfig(c => c ? { ...c, default_language: e.target.value } : null)
                      saveConfig({ default_language: e.target.value })
                    }}
                    className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                    <option value="hi-en">Hindi + English (Hinglish)</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="mr">Marathi</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'billing' && (
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Choose Your Elyra Plan</h2>
              <p className="text-slate-500 mt-2">
                Scale your AI voice assistant with the right plan
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan === plan.id}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  saveConfig({ plan: selectedPlan })
                  // In production: redirect to payment
                }}
                className="px-8 py-3 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition flex items-center gap-2"
              >
                <CreditCard size={18} />
                {config?.plan === selectedPlan ? 'Current Plan' : `Upgrade to ${PLANS.find(p => p.id === selectedPlan)?.name}`}
              </button>
            </div>

            {/* Features Comparison */}
            <div className="mt-12 bg-surface-800/30 rounded-xl border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-4">All Plans Include</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { icon: Zap, label: 'AI Voice Assistant', desc: 'Intelligent conversations' },
                  { icon: Globe, label: 'Multi-language', desc: 'Hindi, English & more' },
                  { icon: Shield, label: 'Call Recording', desc: 'Secure cloud storage' },
                  { icon: TrendingUp, label: 'Analytics', desc: 'Real-time insights' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
                      <feature.icon size={18} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{feature.label}</p>
                      <p className="text-xs text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
