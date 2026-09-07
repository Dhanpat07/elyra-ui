/**
 * Phone Numbers Page - LAALI Voice AI Platform
 * 
 * Purchase and manage phone numbers for voice agents
 * Supports Indian (toll-free, local) and international numbers
 * 
 * Backend Integration:
 * - India: Exotel API (TRAI compliant)
 * - International: Telnyx API
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Plus,
  Search,
  Globe,
  MapPin,
  Check,
  X,
  Loader2,
  Copy,
  Trash2,
  Settings,
  Bot,
  IndianRupee,
  Star,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  PhoneForwarded,
  PhoneIncoming,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib';
import { useStore } from '../store';
import { usePhoneNumbers } from '../hooks/useSupabase';
import type { AvailableNumber } from '../hooks/useSupabase';
import { toast } from 'sonner';

// Types
interface PhoneNumber {
  id: string;
  number: string;
  country: string;
  countryCode: string;
  type: 'local' | 'toll-free' | 'mobile';
  status: 'active' | 'pending' | 'inactive';
  assignedAgent?: string;
  monthlyPrice: number;
  setupPrice: number;
  capabilities: string[];
  createdAt: string;
}

interface AvailableNumber {
  number: string;
  phone_number?: string;
  country: string;
  countryCode: string;
  region?: string;
  type: 'local' | 'toll-free' | 'mobile';
  vanity?: boolean;
  vanity_number?: boolean;
  monthlyPrice: number;
  monthly_cost?: number;
  setupPrice: number;
  capabilities: string[];
}

// Country options - Expanded list for global coverage
const COUNTRIES = [
  // Asia
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', region: 'Asia' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', region: 'Asia' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED', region: 'Asia' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', region: 'Asia' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', region: 'Asia' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', region: 'Asia' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP', region: 'Asia' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB', region: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', region: 'Asia' },
  // Americas
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', region: 'Americas' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', region: 'Americas' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', region: 'Americas' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', region: 'Americas' },
  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', region: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', region: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', region: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', region: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', region: 'Europe' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', region: 'Europe' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', region: 'Europe' },
  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', region: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', region: 'Oceania' },
  // Africa
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', region: 'Africa' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', region: 'Africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', region: 'Africa' },
];

// States/Regions by country
const STATES: Record<string, { code: string; name: string }[]> = {
  IN: [
    { code: 'DL', name: 'Delhi' },
    { code: 'MH', name: 'Maharashtra (Mumbai)' },
    { code: 'KA', name: 'Karnataka (Bangalore)' },
    { code: 'TN', name: 'Tamil Nadu (Chennai)' },
    { code: 'WB', name: 'West Bengal (Kolkata)' },
    { code: 'GJ', name: 'Gujarat (Ahmedabad)' },
    { code: 'RJ', name: 'Rajasthan (Jaipur)' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'TS', name: 'Telangana (Hyderabad)' },
    { code: 'KL', name: 'Kerala' },
    { code: 'PB', name: 'Punjab' },
    { code: 'HR', name: 'Haryana' },
    { code: 'BR', name: 'Bihar' },
    { code: 'OR', name: 'Odisha' },
    { code: 'AS', name: 'Assam' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'CG', name: 'Chhattisgarh' },
    { code: 'UK', name: 'Uttarakhand' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'GA', name: 'Goa' },
    { code: 'JK', name: 'Jammu & Kashmir' },
  ],
  US: [
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' },
    { code: 'TX', name: 'Texas' },
    { code: 'FL', name: 'Florida' },
    { code: 'IL', name: 'Illinois' },
    { code: 'WA', name: 'Washington' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'GA', name: 'Georgia' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'VA', name: 'Virginia' },
    { code: 'CO', name: 'Colorado' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'OH', name: 'Ohio' },
  ],
  GB: [
    { code: 'LDN', name: 'London' },
    { code: 'MAN', name: 'Manchester' },
    { code: 'BHM', name: 'Birmingham' },
    { code: 'LDS', name: 'Leeds' },
    { code: 'GLA', name: 'Glasgow' },
    { code: 'LIV', name: 'Liverpool' },
    { code: 'BRS', name: 'Bristol' },
    { code: 'EDI', name: 'Edinburgh' },
  ],
  AE: [
    { code: 'DXB', name: 'Dubai' },
    { code: 'AUH', name: 'Abu Dhabi' },
    { code: 'SHJ', name: 'Sharjah' },
    { code: 'AJM', name: 'Ajman' },
  ],
  SG: [
    { code: 'SG', name: 'Singapore' },
  ],
  AU: [
    { code: 'NSW', name: 'New South Wales (Sydney)' },
    { code: 'VIC', name: 'Victoria (Melbourne)' },
    { code: 'QLD', name: 'Queensland (Brisbane)' },
    { code: 'WA', name: 'Western Australia (Perth)' },
    { code: 'SA', name: 'South Australia (Adelaide)' },
  ],
};

// Pricing by country and type (in INR for India, converted for display)
const PRICING: Record<string, Record<string, { monthly: number; setup: number }>> = {
  IN: {
    'toll-free': { monthly: 1499, setup: 999 },
    'local': { monthly: 799, setup: 499 },
    'mobile': { monthly: 599, setup: 299 },
  },
  US: {
    'toll-free': { monthly: 2499, setup: 1499 },
    'local': { monthly: 1299, setup: 799 },
    'mobile': { monthly: 999, setup: 499 },
  },
  GB: {
    'toll-free': { monthly: 2999, setup: 1999 },
    'local': { monthly: 1499, setup: 999 },
    'mobile': { monthly: 1199, setup: 699 },
  },
  AE: {
    'toll-free': { monthly: 3499, setup: 2499 },
    'local': { monthly: 1999, setup: 1499 },
    'mobile': { monthly: 1499, setup: 999 },
  },
  SG: {
    'toll-free': { monthly: 2799, setup: 1799 },
    'local': { monthly: 1399, setup: 899 },
    'mobile': { monthly: 1099, setup: 599 },
  },
  AU: {
    'toll-free': { monthly: 2699, setup: 1699 },
    'local': { monthly: 1349, setup: 849 },
    'mobile': { monthly: 1049, setup: 549 },
  },
};

// ============================================
// 📞 CALL FORWARDING SETUP WIZARD
// Works for India (carrier codes) and International
// ============================================

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Shared LAALI DID (all businesses forward to this)
const LAALI_DID = '9992775444';
const LAALI_DID_DISPLAY = '+91 99927 75444';

interface ForwardingBusiness {
  business_id: string;
  business_name: string;
  forwarded_number: string;
  laali_did: string;
  country: string;
  setup_complete: boolean;
}

// India carrier info
const INDIA_CARRIERS = [
  { name: 'Jio', logo: '🔵', code: '**21*' },
  { name: 'Airtel', logo: '🔴', code: '**21*' },
  { name: 'Vi', logo: '🟡', code: '**21*' },
  { name: 'BSNL', logo: '🟢', code: '**21*' },
];

// International forwarding info
const INTL_INSTRUCTIONS: Record<string, { code: string; note: string }> = {
  US: { code: '*72', note: 'Dial *72 + number, wait for confirmation tone' },
  GB: { code: '*21*', note: 'Dial **21*number# from your phone' },
  AE: { code: '**21*', note: 'Same as India - dial **21*number#' },
  SG: { code: '*72', note: 'Dial *72 + number' },
  AU: { code: '*21*', note: 'Dial *21*number#' },
  DEFAULT: { code: '**21*', note: 'Contact your carrier for forwarding code' },
};

function CallForwardingWizard() {
  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [country, setCountry] = useState('IN');
  const [copiedCode, setCopiedCode] = useState(false);
  const [forwardingVerified, setForwardingVerified] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [business, setBusiness] = useState<ForwardingBusiness | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    forwarded_number: '',
    business_name: '',
    owner_name: '',
    business_type: 'store',
  });

  // Load saved business
  useEffect(() => {
    const saved = localStorage.getItem('laali_forwarding_business');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setBusiness(data);
        if (data.setup_complete) {
          setStep(3);
        } else {
          setStep(2);
        }
      } catch {
        localStorage.removeItem('laali_forwarding_business');
      }
    }
  }, []);

  // Get forwarding code based on country
  const getForwardingCode = () => {
    const numberOnly = LAALI_DID.replace(/\D/g, '');
    if (country === 'IN') {
      // India: *21*NUMBER# (single asterisk)
      return `*21*${numberOnly}#`;
    }
    const info = INTL_INSTRUCTIONS[country] || INTL_INSTRUCTIONS.DEFAULT;
    return `${info.code}${numberOnly}${info.code.includes('*') ? '#' : ''}`;
  };

  const getCancelCode = () => {
    if (country === 'IN') return '##21#';  // Correct: ##21#
    if (['US', 'SG'].includes(country)) return '*73';
    return '##21#';
  };

  // Copy code
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Copied! Now dial this from your phone');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Register business
  const handleRegister = async () => {
    if (!formData.forwarded_number || !formData.business_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch(`${API_BASE}/receptionist/business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, country }),
      });

      if (response.ok) {
        const data = await response.json();
        const businessData = { ...data, country, setup_complete: false };
        setBusiness(businessData);
        localStorage.setItem('laali_forwarding_business', JSON.stringify(businessData));
        setStep(2);
        toast.success('Great! Now let\'s set up forwarding');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Registration failed');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  // Complete setup
  const completeSetup = () => {
    if (business) {
      const updated = { ...business, setup_complete: true };
      setBusiness(updated);
      localStorage.setItem('laali_forwarding_business', JSON.stringify(updated));
      setStep(3);
      toast.success('🎉 Setup complete! LAALI is now answering your calls');
    }
  };

  // Reset wizard
  const resetWizard = () => {
    localStorage.removeItem('laali_forwarding_business');
    setBusiness(null);
    setStep(1);
    setFormData({ forwarded_number: '', business_name: '', owner_name: '', business_type: 'store' });
    setForwardingVerified(false);
  };

  // Progress indicator
  const ProgressSteps = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
            step >= s 
              ? "bg-gold-500 text-surface-900" 
              : "bg-surface-700 text-slate-500"
          )}>
            {step > s ? <Check size={16} /> : s}
          </div>
          {s < 3 && (
            <div className={cn(
              "w-12 h-0.5 mx-1",
              step > s ? "bg-gold-500" : "bg-surface-700"
            )} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-800/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden"
    >
      {/* Header with gradient accent */}
      <div className="h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500" />
      
      <div className="p-6">
        {/* Title */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
              <PhoneForwarded className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Use Your Existing Number</h3>
              <p className="text-sm text-slate-500">Forward calls to LAALI AI • 2-minute setup</p>
            </div>
          </div>
          {business && (
            <button
              onClick={resetWizard}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>

        {/* Progress */}
        <ProgressSteps />

        {/* Step 1: Register Business */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <h4 className="text-white font-medium">Step 1: Tell us about your business</h4>
              <p className="text-sm text-slate-500">So we can personalize your AI receptionist</p>
            </div>

            {/* Country Selection */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Country</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { code: 'IN', flag: '🇮🇳', name: 'India' },
                  { code: 'US', flag: '🇺🇸', name: 'USA' },
                  { code: 'GB', flag: '🇬🇧', name: 'UK' },
                  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
                ].map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCountry(c.code)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      country === c.code
                        ? "bg-gold-500/10 border-gold-500/50 text-white"
                        : "bg-surface-900/50 border-white/5 text-slate-400 hover:border-white/10"
                    )}
                  >
                    <div className="text-xl mb-1">{c.flag}</div>
                    <div className="text-xs">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Your Business Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={formData.forwarded_number}
                  onChange={(e) => setFormData({ ...formData, forwarded_number: e.target.value })}
                  placeholder={country === 'IN' ? '+91 98765 43210' : '+1 555 123 4567'}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-900/50 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                This is the number your customers currently call
              </p>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Business Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="e.g., Sharma Clinic, Pizza Palace"
                className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50 transition-colors"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Business Type</label>
              <select
                value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-white/10 text-white focus:outline-none focus:border-gold-500/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
              >
                <option value="clinic">🏥 Clinic / Healthcare</option>
                <option value="salon">💇 Salon / Spa</option>
                <option value="restaurant">🍽️ Restaurant / Cafe</option>
                <option value="store">🏪 Retail Store</option>
                <option value="service">🔧 Service Business</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleRegister}
              disabled={registering || !formData.forwarded_number || !formData.business_name}
              className="w-full py-3.5 rounded-xl bg-gold-500 text-surface-900 font-semibold hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {registering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Step 2: Set Up Forwarding */}
        {step === 2 && business && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <h4 className="text-white font-medium">Step 2: Activate Call Forwarding</h4>
              <p className="text-sm text-slate-500">Dial this code from your business phone</p>
            </div>

            {/* The Big Code */}
            <div className="bg-surface-900/80 rounded-2xl p-6 border border-white/[0.08] text-center">
              <div className="text-sm text-slate-500 mb-2">Dial from {business.forwarded_number}</div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-wider mb-3">
                {getForwardingCode()}
              </div>
              <button
                onClick={() => copyCode(getForwardingCode())}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto",
                  copiedCode
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-gold-500/10 text-gold-400 border border-gold-500/30 hover:bg-gold-500/20"
                )}
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-surface-900/50 rounded-xl p-4 border border-white/[0.05]">
              <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-gold-400" />
                How to activate
              </h5>
              <ol className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-slate-300 flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>Open your phone's dialer app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-slate-300 flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>Type the code above exactly as shown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-slate-300 flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>Press the call button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                  <span>You'll see <span className="text-green-400">"Call Forwarding Activated"</span></span>
                </li>
              </ol>
            </div>

            {/* India Carriers */}
            {country === 'IN' && (
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-xs text-slate-600">Works with:</span>
                {INDIA_CARRIERS.map((c) => (
                  <span key={c.name} className="text-xs text-slate-400">{c.logo} {c.name}</span>
                ))}
              </div>
            )}

            {/* Did it work? */}
            <div className="flex items-center gap-3 p-4 bg-surface-900/50 rounded-xl border border-white/[0.05]">
              <input
                type="checkbox"
                id="verified"
                checked={forwardingVerified}
                onChange={(e) => setForwardingVerified(e.target.checked)}
                className="w-5 h-5 rounded bg-surface-700 border-white/20 text-gold-500 focus:ring-gold-500/50 cursor-pointer"
              />
              <label htmlFor="verified" className="text-sm text-slate-300 cursor-pointer flex-1">
                I've dialed the code and saw "Call Forwarding Activated"
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={completeSetup}
                disabled={!forwardingVerified}
                className="flex-1 py-3 rounded-xl bg-gold-500 text-surface-900 font-semibold hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Complete Setup
                <Check className="w-4 h-4" />
              </button>
            </div>

            {/* Cancel code hint */}
            <p className="text-xs text-center text-slate-600">
              To cancel forwarding later, dial <code className="text-slate-400">{getCancelCode()}</code>
            </p>
          </motion.div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && business && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">You're All Set! 🎉</h4>
            <p className="text-slate-400 mb-6">
              LAALI is now answering calls for <span className="text-white">{business.business_name}</span>
            </p>

            {/* Status Card */}
            <div className="bg-surface-900/50 rounded-xl p-4 border border-white/[0.05] text-left mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Forwarding Status</span>
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Your Number</span>
                  <span className="text-white font-mono">{business.forwarded_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Forwarding To</span>
                  <span className="text-white font-mono">{LAALI_DID_DISPLAY}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  copyCode(getCancelCode());
                  toast.success('Cancel code copied');
                }}
                className="flex-1 py-2.5 rounded-xl bg-surface-700 text-slate-300 hover:bg-surface-600 transition-colors text-sm"
              >
                Copy Cancel Code
              </button>
              <button
                onClick={resetWizard}
                className="flex-1 py-2.5 rounded-xl bg-surface-700 text-slate-300 hover:bg-surface-600 transition-colors text-sm"
              >
                Add Another Number
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// All data comes from real APIs - no mock data

export function PhoneNumbersPage() {
  const { setActivePage } = useStore();
  const { 
    phoneNumbers, 
    loading: loadingNumbers, 
    searchAvailableNumbers, 
    provisionNumber, 
    releaseNumber 
  } = usePhoneNumbers();
  
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedType, setSelectedType] = useState<'toll-free' | 'local' | 'mobile'>('toll-free');
  const [selectedState, setSelectedState] = useState('');
  const [searchPattern, setSearchPattern] = useState('');
  const [showVanityOnly, setShowVanityOnly] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [resultLimit, setResultLimit] = useState(10);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'number'>('price-low');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [searchingNumbers, setSearchingNumbers] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string>('');
  const [showExchangeRates, setShowExchangeRates] = useState(false);

  // Fetch exchange rates on mount
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('http://localhost:8000/phone/exchange-rates');
        if (response.ok) {
          const data = await response.json();
          setExchangeRates(data.rates_to_inr || {});
          setRatesLastUpdated(data.last_updated || '');
        }
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
      }
    };
    fetchExchangeRates();
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (number: string, country: string): string => {
    const clean = number.replace(/\D/g, '');
    if (country === 'IN') {
      if (clean.startsWith('1800')) {
        // Toll-free: 1800-XXX-XXXX
        return clean.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
      }
      // Regular: +91 XXXXX XXXXX
      return `+91 ${clean.slice(-10, -5)} ${clean.slice(-5)}`;
    }
    if (country === 'US') {
      return `+1 (${clean.slice(-10, -7)}) ${clean.slice(-7, -4)}-${clean.slice(-4)}`;
    }
    return number;
  };

  // Sort numbers based on selected criteria
  const sortedNumbers = [...availableNumbers].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.monthlyPrice - b.monthlyPrice;
      case 'price-high':
        return b.monthlyPrice - a.monthlyPrice;
      case 'number':
        return a.number.localeCompare(b.number);
      default:
        return 0;
    }
  });

  // Map internal type to API type
  const mapTypeToApi = (type: string): string => {
    const mapping: Record<string, string> = {
      'toll-free': 'toll_free',
      'local': 'local',
      'mobile': 'mobile',
    };
    return mapping[type] || type;
  };

  // Search for available numbers using real API
  const searchNumbers = async () => {
    setSearchingNumbers(true);
    setPurchaseError(null);
    setSelectedNumber(null);
    
    try {
      const numbers = await searchAvailableNumbers({
        country: selectedCountry,
        number_type: mapTypeToApi(selectedType),
        region: selectedState || undefined,
        limit: resultLimit,
      });
      
      // Transform API response to display format
      let transformed = numbers.map(num => ({
        ...num,
        number: num.phone_number,
        country: COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry,
        countryCode: selectedCountry,
        type: selectedType,
        region: num.region || '',
        vanity: num.vanity_number || false,
        monthlyPrice: num.monthly_cost || 0,
        setupPrice: num.setup_cost || num.monthly_cost || 0,  // Use API setup cost, fallback to monthly
        capabilities: [
          ...(num.capabilities?.voice ? ['voice'] : ['voice']),
          ...(num.capabilities?.sms ? ['sms'] : []),
        ],
      }));

      // Apply client-side filters
      if (searchPattern) {
        transformed = transformed.filter(n => n.number.includes(searchPattern));
      }
      if (showVanityOnly) {
        transformed = transformed.filter(n => n.vanity);
      }
      if (smsEnabled) {
        transformed = transformed.filter(n => n.capabilities.includes('sms'));
      }
      
      setAvailableNumbers(transformed);
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to search numbers. Please try again.');
      // No fallback - show empty state
    } finally {
      setSearchingNumbers(false);
    }
  };

  // Purchase number using real API
  const handlePurchaseNumber = async () => {
    if (!selectedNumber) return;
    
    setPurchasing(true);
    setPurchaseError(null);
    
    const result = await provisionNumber({
      phone_number: selectedNumber.number || selectedNumber.phone_number,
      number_type: mapTypeToApi(selectedType),
      country: selectedCountry,
      friendly_name: `LAALI - ${selectedType} - ${selectedCountry}`,
    });
    
    if (result.success) {
      toast.success(`Successfully purchased ${selectedNumber.number || selectedNumber.phone_number}`);
      setShowBuyModal(false);
      setSelectedNumber(null);
      setAvailableNumbers([]);
    } else {
      setPurchaseError(result.error || 'Failed to purchase number');
      toast.error(result.error || 'Failed to purchase number');
    }
    
    setPurchasing(false);
  };

  // Copy number to clipboard
  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Delete/Release number
  const deleteNumber = async (phoneNumber: string) => {
    if (!confirm('Are you sure you want to release this number? This action cannot be undone.')) {
      return;
    }
    
    const result = await releaseNumber(phoneNumber);
    if (result.success) {
      toast.success('Number released successfully');
    } else {
      toast.error(result.error || 'Failed to release number');
    }
  };

  const currentPricing = PRICING[selectedCountry]?.[selectedType] || { monthly: 999, setup: 499 };

  // Transform phoneNumbers from hook to display format
  const ownedNumbers = phoneNumbers.map(p => ({
    id: p.id,
    number: p.phone_number,
    country: COUNTRIES.find(c => c.code === p.country)?.name || p.country,
    countryCode: p.country,
    type: (p.number_type === 'toll_free' ? 'toll-free' : p.number_type) as 'local' | 'toll-free' | 'mobile',
    status: p.status as 'active' | 'pending' | 'inactive',
    assignedAgent: p.assigned_agent_name,
    monthlyPrice: p.monthly_cost,
    setupPrice: PRICING[p.country]?.[p.number_type === 'toll_free' ? 'toll-free' : p.number_type]?.setup || 499,
    capabilities: ['voice', ...(p.number_type === 'toll_free' ? ['sms'] : [])],
    createdAt: p.created_at,
  }));

  // Loading state
  if (loadingNumbers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Phone Numbers</h2>
          <p className="text-slate-500 mt-1">
            {ownedNumbers.length} numbers • {ownedNumbers.filter(n => n.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={() => {
            setShowBuyModal(true);
            searchNumbers();
          }}
          className="px-4 py-2.5 rounded-xl bg-gold-500 text-surface-900 font-medium hover:bg-gold-400 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Buy Number
        </button>
      </div>

      {/* Pricing Overview with Exchange Rates */}
      <div className="bg-gradient-to-r from-gold-500/10 to-amber-500/5 rounded-2xl border border-gold-500/20 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6 text-gold-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">LAALI Phone Number Pricing</h3>
              <button
                onClick={() => setShowExchangeRates(!showExchangeRates)}
                className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
              >
                <Globe size={12} />
                {showExchangeRates ? 'Hide' : 'Show'} Exchange Rates
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-400">🇮🇳 India Toll-Free</div>
                <div className="text-white font-medium">From ₹1,799/mo</div>
              </div>
              <div>
                <div className="text-slate-400">🇺🇸 US Toll-Free</div>
                <div className="text-white font-medium">From ₹{Math.round(exchangeRates['USD'] || 95)}/mo</div>
              </div>
              <div>
                <div className="text-slate-400">🇬🇧 UK Numbers</div>
                <div className="text-white font-medium">From ₹{Math.round(exchangeRates['GBP'] || 129)}/mo</div>
              </div>
              <div>
                <div className="text-slate-400">🌐 27+ Countries</div>
                <div className="text-white font-medium">All prices in INR</div>
              </div>
            </div>
            
            {/* Exchange Rates Section */}
            <AnimatePresence>
              {showExchangeRates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-gold-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <Globe size={14} className="text-gold-400" />
                        Live Exchange Rates (to INR)
                      </h4>
                      <span className="text-xs text-slate-500">
                        Updated: {ratesLastUpdated ? new Date(ratesLastUpdated).toLocaleDateString() : 'Loading...'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                      {[
                        { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
                        { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
                        { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
                        { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham' },
                        { code: 'SGD', flag: '🇸🇬', name: 'Singapore $' },
                        { code: 'AUD', flag: '🇦🇺', name: 'Australian $' },
                        { code: 'CAD', flag: '🇨🇦', name: 'Canadian $' },
                        { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen' },
                        { code: 'CHF', flag: '🇨🇭', name: 'Swiss Franc' },
                        { code: 'MYR', flag: '🇲🇾', name: 'Malaysian RM' },
                        { code: 'THB', flag: '🇹🇭', name: 'Thai Baht' },
                        { code: 'ZAR', flag: '🇿🇦', name: 'South Africa' },
                      ].map((currency) => (
                        <div key={currency.code} className="bg-surface-700/50 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-slate-400">
                            <span>{currency.flag}</span>
                            <span>{currency.code}</span>
                          </div>
                          <div className="text-white font-medium mt-0.5">
                            ₹{exchangeRates[currency.code]?.toFixed(2) || '...'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      * Rates from ExchangeRate-API, refreshed hourly. All phone number prices are displayed in INR.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-xs text-slate-500 mt-2">* Prices converted to INR using live exchange rates.</p>
          </div>
        </div>
      </div>

      {/* 📞 Call Forwarding Wizard */}
      <CallForwardingWizard />

      {/* Owned Numbers */}
      {ownedNumbers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-800 rounded-2xl border border-white/[0.05] p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold-500/10 flex items-center justify-center">
            <Phone className="w-8 h-8 text-gold-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No phone numbers yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Buy a phone number to start receiving calls on your voice agents.
          </p>
          <button
            onClick={() => {
              setShowBuyModal(true);
              searchNumbers();
            }}
            className="px-6 py-3 rounded-xl bg-gold-500 text-surface-900 font-medium hover:bg-gold-400 transition-all inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Buy Your First Number
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {ownedNumbers.map((phone, i) => (
            <motion.div
              key={phone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5 hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-2xl">
                    {COUNTRIES.find(c => c.code === phone.countryCode)?.flag || '🌐'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-white font-mono">{phone.number}</span>
                      <button
                        onClick={() => copyNumber(phone.number)}
                        className="p-1 rounded hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedNumber === phone.number ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full capitalize",
                        phone.status === 'active' && "bg-emerald-500/20 text-emerald-400",
                        phone.status === 'pending' && "bg-amber-500/20 text-amber-400",
                        phone.status === 'inactive' && "bg-slate-500/20 text-slate-400",
                      )}>
                        {phone.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {phone.country} • {phone.type}
                      </span>
                      {phone.assignedAgent && (
                        <span className="flex items-center gap-1">
                          <Bot size={12} />
                          {phone.assignedAgent}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <IndianRupee size={12} />
                        {phone.monthlyPrice}/mo
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!phone.assignedAgent && (
                    <button
                      onClick={() => setActivePage('agents')}
                      className="px-4 py-2 rounded-xl bg-gold-500/10 text-gold-400 font-medium text-sm hover:bg-gold-500/20 transition-colors flex items-center gap-2"
                    >
                      <Bot size={14} />
                      Assign Agent
                    </button>
                  )}
                  <button
                    onClick={() => deleteNumber(phone.number)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Buy Number Modal - Enhanced */}
      <AnimatePresence>
        {showBuyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBuyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-800 rounded-2xl border border-white/[0.1] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
                <div>
                  <h3 className="text-lg font-semibold text-white">Buy Phone Number</h3>
                  <p className="text-sm text-slate-500">Search and purchase LAALI numbers</p>
                </div>
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Compact Filters Section */}
              <div className="p-4 border-b border-white/[0.05] space-y-3 bg-surface-700/20">
                {/* Row 1: Country & Type */}
                <div className="flex flex-wrap gap-4">
                  {/* Country */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-slate-500 mb-1.5 block font-medium uppercase tracking-wide">Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedState('');
                        setAvailableNumbers([]);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-surface-700 border border-white/[0.05] text-white text-sm focus:outline-none focus:border-gold-500/50"
                    >
                      <optgroup label="🌏 Asia">
                        {COUNTRIES.filter(c => c.region === 'Asia').map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌎 Americas">
                        {COUNTRIES.filter(c => c.region === 'Americas').map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌍 Europe">
                        {COUNTRIES.filter(c => c.region === 'Europe').map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌏 Oceania">
                        {COUNTRIES.filter(c => c.region === 'Oceania').map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌍 Africa">
                        {COUNTRIES.filter(c => c.region === 'Africa').map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Row 2: Type, State, Pattern */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Number Type */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block font-medium uppercase tracking-wide">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value as any);
                        setAvailableNumbers([]);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-surface-700 border border-white/[0.05] text-white text-sm focus:outline-none focus:border-gold-500/50"
                    >
                      <option value="toll-free">⭐ Toll-Free (Popular)</option>
                      <option value="local">📍 Local/Landline</option>
                      <option value="mobile">📱 Mobile</option>
                    </select>
                  </div>

                  {/* State/Region */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block font-medium uppercase tracking-wide">
                      {selectedCountry === 'IN' ? 'State' : 'Region'}
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setAvailableNumbers([]);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-surface-700 border border-white/[0.05] text-white text-sm focus:outline-none focus:border-gold-500/50"
                    >
                      <option value="">All {selectedCountry === 'IN' ? 'States' : 'Regions'}</option>
                      {STATES[selectedCountry]?.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number Contains */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block font-medium uppercase tracking-wide">Contains</label>
                    <input
                      type="text"
                      value={searchPattern}
                      onChange={(e) => setSearchPattern(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 1234"
                      maxLength={6}
                      className="w-full px-3 py-2 rounded-lg bg-surface-700 border border-white/[0.05] text-white text-sm focus:outline-none focus:border-gold-500/50 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Search Button */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block font-medium uppercase tracking-wide">&nbsp;</label>
                    <button
                      onClick={searchNumbers}
                      disabled={searchingNumbers}
                      className="w-full px-4 py-2 rounded-lg bg-gold-500 text-surface-900 font-semibold text-sm hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {searchingNumbers ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}
                      Search
                    </button>
                  </div>
                </div>

                {/* Row 3: Advanced Options */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={showVanityOnly}
                      onChange={(e) => setShowVanityOnly(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-700 border-white/[0.1] text-gold-500 focus:ring-gold-500/50"
                    />
                    <span className="text-slate-300">Vanity Numbers</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={(e) => setSmsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-700 border-white/[0.1] text-gold-500 focus:ring-gold-500/50"
                    />
                    <span className="text-slate-300">SMS Capable</span>
                  </label>

                  <div className="flex items-center gap-2 text-sm ml-auto">
                    <span className="text-slate-500">Show:</span>
                    <select
                      value={resultLimit}
                      onChange={(e) => setResultLimit(Number(e.target.value))}
                      className="px-2 py-1 rounded bg-surface-700 border border-white/[0.05] text-white text-sm focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* LAALI Badge */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20">
                    <Shield size={12} className="text-gold-400" />
                    <span className="text-xs text-gold-400 font-medium">
                      {selectedCountry === 'IN' ? 'TRAI Compliant' : 'Premium Quality'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {/* Results Header */}
                {availableNumbers.length > 0 && (
                  <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between bg-surface-700/30">
                    <div className="text-sm">
                      <span className="text-white font-medium">{availableNumbers.length} numbers</span>
                      <span className="text-slate-500 ml-2">
                        ₹{Math.min(...availableNumbers.map(n => n.monthlyPrice)).toLocaleString('en-IN')} - ₹{Math.max(...availableNumbers.map(n => n.monthlyPrice)).toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-2 py-1 rounded bg-surface-700 border border-white/[0.05] text-white text-sm focus:outline-none"
                      >
                        <option value="price-low">Price ↑</option>
                        <option value="price-high">Price ↓</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Available Numbers List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {searchingNumbers ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                      <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                      <span className="text-sm text-slate-500">Searching available numbers...</span>
                    </div>
                  ) : availableNumbers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-surface-700/50 flex items-center justify-center mb-3">
                        <Phone className="w-7 h-7 text-slate-500" />
                      </div>
                      <p className="text-slate-400 font-medium">Ready to search</p>
                      <p className="text-slate-500 text-sm mt-1">Configure filters above and click Search</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {sortedNumbers.map((number, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => setSelectedNumber(number)}
                          className={cn(
                            "w-full p-3 rounded-xl text-left transition-all border flex items-center justify-between group",
                            selectedNumber?.number === number.number
                              ? "bg-gold-500/10 border-gold-500/50 ring-1 ring-gold-500/30"
                              : "bg-surface-700/50 border-white/[0.05] hover:border-white/[0.1] hover:bg-surface-700"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                              selectedNumber?.number === number.number
                                ? "border-gold-500 bg-gold-500"
                                : "border-slate-500 group-hover:border-slate-400"
                            )}>
                              {selectedNumber?.number === number.number && (
                                <Check size={12} className="text-surface-900" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-white text-base tracking-wide">
                                  {formatPhoneNumber(number.number, selectedCountry)}
                                </span>
                                {number.vanity && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
                                    VANITY
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                {number.region && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={10} />
                                    {STATES[selectedCountry]?.find(s => s.code === number.region)?.name || number.region}
                                  </span>
                                )}
                                <span>• Instant activation</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-base font-semibold text-gold-400">
                                ₹{number.monthlyPrice.toLocaleString('en-IN')}
                                <span className="text-xs font-normal text-slate-500">/mo</span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                + ₹{number.setupPrice} setup
                              </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                Voice
                              </span>
                              {number.capabilities.includes('sms') && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                  SMS
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-white/[0.05] bg-surface-700/30">
                <div>
                  {selectedNumber ? (
                    <div>
                      <div className="text-xs text-slate-500">Selected: <span className="text-slate-300 font-mono">{formatPhoneNumber(selectedNumber.number, selectedCountry)}</span></div>
                      <div className="text-lg font-semibold text-white">
                        ₹{(selectedNumber.setupPrice + selectedNumber.monthlyPrice).toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500 ml-1">(₹{selectedNumber.setupPrice} + ₹{selectedNumber.monthlyPrice})</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">Select a number to purchase</div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchaseNumber}
                    disabled={!selectedNumber || purchasing}
                    className="px-5 py-2 rounded-xl bg-gold-500 text-surface-900 font-semibold hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Purchase Number
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhoneNumbersPage;
