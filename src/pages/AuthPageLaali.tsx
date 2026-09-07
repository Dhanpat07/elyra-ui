import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Building2, Eye, EyeOff, Loader2,
  Phone, ArrowRight, ArrowLeft, CheckCircle2, Sparkles,
  Shield, Clock, Globe, MessageSquare,
} from 'lucide-react';
import { cn } from '../lib';
import { useAuthContext } from '../contexts/AuthContext';
import { LaaliLogo, CCDSteps, LaaliFooter } from '../components/LaaliLogo';

type AuthMode = 'welcome' | 'login' | 'signup' | 'otp' | 'magic-link' | 'forgot-password' | 'verify-otp';

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// GitHub Icon SVG
const GitHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

// Feature highlights
const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Voice', desc: 'Human-like conversations' },
  { icon: Clock, title: '3 Minutes Setup', desc: 'Connect, Choose, Deploy' },
  { icon: Globe, title: 'Multi-Language', desc: '10+ languages supported' },
  { icon: Shield, title: 'Enterprise Ready', desc: 'SOC2 compliant' },
];

// Compact features for mobile
const MOBILE_FEATURES = [
  { icon: Sparkles, text: 'AI Voice' },
  { icon: Clock, text: '3 Min Setup' },
  { icon: Globe, text: 'Multi-Language' },
];

// Testimonials
const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'CTO at TechCorp', text: 'LAALI reduced our support costs by 60%', avatar: '👨‍💼' },
  { name: 'Priya Patel', role: 'Head of CX at FastShip', text: 'Setup took 3 minutes, not 3 months', avatar: '👩‍💻' },
  { name: 'Alex Chen', role: 'Founder at StartupXYZ', text: 'The accuracy is unbelievable', avatar: '🧑‍💼' },
];

// Stats
const STATS = [
  { value: '2.8M+', label: 'Calls Handled' },
  { value: '50ms', label: 'Response Time' },
  { value: '97%', label: 'Accuracy' },
];

export function AuthPage() {
  const { signIn, signUp, sendOTP, verifyOTP, sendMagicLink, sendEmailOTP, verifyEmailOTP, signInWithGoogle, signInWithGitHub, resetPassword, loading } = useAuthContext();
  
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(i => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // OTP countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Form handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError('Name is required'); return; }
    if (!companyName.trim()) { setError('Company name is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    
    const tenantId = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    const { error } = await signUp(email, password, name, tenantId);
    if (error) {
      setError(error);
    } else {
      setSuccess('Account created! Check your email to verify.');
      setTimeout(() => setMode('login'), 2000);
    }
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) { setError('Please enter a valid phone number'); return; }
    setError(null);
    const { error } = await sendOTP(phone);
    if (error) { setError(error); } else { setMode('verify-otp'); setCountdown(60); setSuccess('OTP sent!'); }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter complete OTP'); return; }
    setError(null);
    const { error } = await verifyOTP(phone, otpString);
    if (error) setError(error);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setError(null);
    // Use email OTP via our backend (Resend)
    const { error } = await sendEmailOTP(email);
    if (error) { 
      setError(error); 
    } else { 
      setSuccess('Verification code sent! Check your email.'); 
      setMode('verify-otp'); 
      setCountdown(60);
      setOtp(['', '', '', '', '', '']); // Reset OTP input
    }
  };

  // Handle email OTP verification
  const handleVerifyEmailOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter complete verification code'); return; }
    setError(null);
    const { error } = await verifyEmailOTP(email, otpString, name);
    if (error) {
      setError(error);
    } else {
      setSuccess('Email verified! Welcome to LAALI.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  const handleGitHubLogin = async () => {
    setError(null);
    const { error } = await signInWithGitHub();
    if (error) setError(error);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await resetPassword(email);
    if (error) { setError(error); } else { setSuccess('Reset link sent to your email!'); }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-surface-950 via-surface-900 to-gold-950/20 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold-500/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold-500/10 rounded-full" />
        </div>

        {/* Logo & Hero */}
        <div className="relative z-10">
          <LaaliLogo size="lg" className="mb-8" />
          
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Deploy Voice AI
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-purple-400">
              in 3 Minutes
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-md mb-8">
            No ML team. No complex setup. Just connect your data, choose a personality, and go live.
          </p>

          {/* CCD Steps */}
          <div className="bg-surface-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.05]">
            <CCDSteps />
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-2 gap-4 my-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.05] transition-all"
            >
              <feature.icon className="w-8 h-8 text-gold-400 mb-3" />
              <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]"
            >
              <p className="text-white text-lg mb-4">"{TESTIMONIALS[currentTestimonial].text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-purple-600 flex items-center justify-center text-lg">
                  {TESTIMONIALS[currentTestimonial].avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{TESTIMONIALS[currentTestimonial].name}</p>
                  <p className="text-xs text-slate-500">{TESTIMONIALS[currentTestimonial].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === currentTestimonial ? 'bg-gold-500 w-6' : 'bg-slate-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8 pt-6 border-t border-white/[0.05] mt-auto">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Welcome Screen */}
            {mode === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Mobile Logo & Hero */}
                <div className="lg:hidden flex flex-col items-center mb-6">
                  <LaaliLogo size="lg" className="flex-col items-center text-center mb-4" />
                  
                  {/* Mobile Value Prop */}
                  <h2 className="text-2xl font-bold text-white text-center mb-2">
                    Deploy Voice AI
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-purple-400"> in 3 Minutes</span>
                  </h2>
                  <p className="text-sm text-slate-400 text-center mb-4">
                    No ML team. No complex setup. Just go live.
                  </p>
                  
                  {/* Mobile Feature Pills */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {MOBILE_FEATURES.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                        <f.icon size={14} className="text-gold-400" />
                        <span className="text-xs text-slate-300">{f.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Mobile Stats */}
                  <div className="flex justify-center gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold text-white">2.8M+</p>
                      <p className="text-[10px] text-slate-500">Calls</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">50ms</p>
                      <p className="text-[10px] text-slate-500">Response</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">97%</p>
                      <p className="text-[10px] text-slate-500">Accuracy</p>
                    </div>
                  </div>
                </div>

                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to LAALI</h2>
                  <p className="text-slate-500">Deploy voice AI in 3 minutes</p>
                </div>

                {/* Auth Options */}
                <div className="space-y-3">
                  {/* OAuth Buttons Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white text-gray-900 font-medium hover:bg-gray-100 transition-all shadow-lg"
                    >
                      <GoogleIcon />
                      <span className="hidden sm:inline">Google</span>
                    </button>

                    <button
                      onClick={handleGitHubLogin}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#24292e] text-white font-medium hover:bg-[#2f363d] transition-all shadow-lg"
                    >
                      <GitHubIcon />
                      <span className="hidden sm:inline">GitHub</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-slate-600">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    onClick={() => setMode('login')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-surface-800 text-white font-medium hover:bg-surface-700 transition-all border border-white/[0.08]"
                  >
                    <Mail size={18} />
                    Continue with Email
                  </button>

                  <button
                    onClick={() => setMode('otp')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-surface-800 text-white font-medium hover:bg-surface-700 transition-all border border-white/[0.08]"
                  >
                    <Phone size={18} />
                    Continue with Phone
                  </button>

                  <button
                    onClick={() => setMode('magic-link')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-transparent text-slate-400 font-medium hover:text-white hover:bg-white/[0.03] transition-all"
                  >
                    <Sparkles size={18} />
                    Get Magic Link
                  </button>
                </div>

                <p className="text-center text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-gold-400 hover:text-gold-300 font-medium">
                    Sign up free
                  </button>
                </p>
              </motion.div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button onClick={() => setMode('welcome')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Sign in to LAALI</h2>
                <p className="text-slate-500 mb-6">Enter your credentials</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20 transition-all" required />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-slate-400">Password</label>
                      <button type="button" onClick={() => setMode('forgot-password')} className="text-xs text-gold-400 hover:text-gold-300">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-all" required />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</motion.p>}

                  <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-gold-600/20 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-slate-600">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="flex gap-3">
                  <button onClick={handleGoogleLogin} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white hover:bg-surface-700 transition-all">
                    <GoogleIcon /> Google
                  </button>
                  <button onClick={() => setMode('otp')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white hover:bg-surface-700 transition-all">
                    <Phone size={18} /> OTP
                  </button>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                  New to LAALI?{' '}
                  <button onClick={() => setMode('signup')} className="text-gold-400 hover:text-gold-300 font-medium">Create account</button>
                </p>
              </motion.div>
            )}

            {/* Signup Form */}
            {mode === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setMode('welcome')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                <p className="text-slate-500 mb-6">Start deploying voice AI today</p>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-all" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Company</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc" className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-all" required />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Work Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-all" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-all" required />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {(error || success) && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('text-sm rounded-xl px-4 py-3', error ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20')}>
                      {error || success}
                    </motion.p>
                  )}

                  <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-gold-600/20 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : <>Create Account <ArrowRight size={18} /></>}
                  </button>

                  <p className="text-xs text-slate-600 text-center">
                    By signing up, you agree to our <a href="#" className="text-slate-400 hover:text-white">Terms</a> and <a href="#" className="text-slate-400 hover:text-white">Privacy Policy</a>
                  </p>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-gold-400 hover:text-gold-300 font-medium">Sign in</button>
                </p>
              </motion.div>
            )}

            {/* OTP Entry */}
            {mode === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setMode('welcome')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Enter your phone</h2>
                <p className="text-slate-500 mb-6">We'll send a 6-digit code</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        <span>🇮🇳</span><span className="text-sm">+91</span>
                      </div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="w-full pl-20 pr-4 py-3.5 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-all text-lg tracking-wider" />
                    </div>
                  </div>

                  {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</motion.p>}

                  <button onClick={handleSendOTP} disabled={loading || phone.length < 10} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-gold-600/20 flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send OTP <MessageSquare size={18} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Verify OTP */}
            {mode === 'verify-otp' && (
              <motion.div key="verify-otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setMode(phone ? 'otp' : 'magic-link')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {phone ? 'Verify your phone' : 'Verify your email'}
                </h2>
                <p className="text-slate-500 mb-6">
                  {phone ? `Enter the code sent to +91 ${phone}` : `Enter the code sent to ${email}`}
                </p>

                <div className="space-y-6">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        className={cn(
                          'w-12 h-14 text-center text-xl font-bold rounded-xl bg-surface-800 border text-white focus:outline-none transition-all',
                          digit ? 'border-gold-500 ring-2 ring-gold-500/20' : 'border-white/[0.08] focus:border-gold-500/50'
                        )}
                      />
                    ))}
                  </div>

                  {(error || success) && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('text-sm rounded-xl px-4 py-3 text-center', error ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20')}>
                      {error || success}
                    </motion.p>
                  )}

                  <button 
                    onClick={phone ? handleVerifyOTP : handleVerifyEmailOTP} 
                    disabled={loading || otp.join('').length < 6} 
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-gold-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : <>Verify <CheckCircle2 size={18} /></>}
                  </button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-slate-500 text-sm">Resend in <span className="text-white font-medium">{countdown}s</span></p>
                    ) : (
                      <button 
                        onClick={phone ? handleSendOTP : () => { sendEmailOTP(email); setCountdown(60); }} 
                        disabled={loading} 
                        className="text-gold-400 hover:text-gold-300 text-sm font-medium"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Magic Link */}
            {mode === 'magic-link' && (
              <motion.div key="magic-link" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setMode('welcome')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Get magic link</h2>
                <p className="text-slate-500 mb-6">Sign in without a password</p>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-all" required />
                    </div>
                  </div>

                  {(error || success) && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('text-sm rounded-xl px-4 py-3', error ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20')}>
                      {error || success}
                    </motion.p>
                  )}

                  <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-gold-600/20 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send Magic Link <Sparkles size={18} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Forgot Password */}
            {mode === 'forgot-password' && (
              <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setMode('login')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Reset password</h2>
                <p className="text-slate-500 mb-6">We'll send you a reset link</p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-all" required />
                    </div>
                  </div>

                  {(error || success) && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('text-sm rounded-xl px-4 py-3', error ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20')}>
                      {error || success}
                    </motion.p>
                  )}

                  <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-gold-600/20 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send Reset Link <ArrowRight size={18} /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.05]">
            <LaaliFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
