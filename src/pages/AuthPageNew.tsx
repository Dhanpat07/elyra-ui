import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Building2, Eye, EyeOff, Loader2,
  Phone, ArrowRight, ArrowLeft, CheckCircle2, Sparkles,
  Shield, Clock, Globe, MessageSquare,
} from 'lucide-react';
import { cn } from '../lib';
import { useAuthContext } from '../contexts/AuthContext';
import { ElyraLogo, PoweredByLaali } from '../components/Logo';

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

// Feature highlights for welcome screen
const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Voice Agents', desc: 'Deploy intelligent voice assistants in minutes' },
  { icon: Clock, title: 'Sub-50ms Responses', desc: 'Ultra-fast RAG with 100% accuracy' },
  { icon: Globe, title: 'Multi-Tenant Ready', desc: 'Complete data isolation per organization' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC2 compliant with end-to-end encryption' },
];

// Testimonial data
const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'CTO at TechCorp', text: 'Elyra reduced our support costs by 60%', avatar: '👨‍💼' },
  { name: 'Priya Patel', role: 'Head of CX at FastShip', text: 'Setup took 5 minutes, not 5 months', avatar: '👩‍💻' },
  { name: 'Alex Chen', role: 'Founder at StartupXYZ', text: 'The accuracy is unbelievable', avatar: '🧑‍💼' },
];

export function AuthPage() {
  const { signIn, signUp, sendOTP, verifyOTP, sendMagicLink, signInWithGoogle, resetPassword, loading } = useAuthContext();
  
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
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Form submissions
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
    
    // Generate tenant ID from company name
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
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError(null);
    const { error } = await sendOTP(phone);
    if (error) {
      setError(error);
    } else {
      setMode('verify-otp');
      setCountdown(60);
      setSuccess('OTP sent to your phone!');
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }
    setError(null);
    const { error } = await verifyOTP(phone, otpString);
    if (error) setError(error);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await sendMagicLink(email);
    if (error) {
      setError(error);
    } else {
      setSuccess('Magic link sent! Check your email.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
    } else {
      setSuccess('Password reset link sent to your email!');
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-surface-950 via-surface-900 to-brand-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.03] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/[0.05] rounded-full" />
        </div>

        {/* Logo & Tagline */}
        <div className="relative z-10">
          <div className="mb-6">
            <ElyraLogo size="lg" showTagline={false} />
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Deploy Voice AI
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
              in Minutes
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-md">
            Connect your data, choose your agent personality, and deploy. 
            That's it. No ML expertise required.
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-4 my-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.05] transition-all"
            >
              <feature.icon className="w-8 h-8 text-brand-400 mb-3" />
              <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-slate-500">{feature.desc}</p>
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-lg">
                  {TESTIMONIALS[currentTestimonial].avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{TESTIMONIALS[currentTestimonial].name}</p>
                  <p className="text-xs text-slate-500">{TESTIMONIALS[currentTestimonial].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Testimonial dots */}
          <div className="flex gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === currentTestimonial ? 'bg-brand-500 w-6' : 'bg-slate-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8 pt-6 border-t border-white/[0.05]">
          <div>
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="text-xs text-slate-500">Companies</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">10M+</p>
            <p className="text-xs text-slate-500">Calls Handled</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">50ms</p>
            <p className="text-xs text-slate-500">Avg Response</p>
          </div>
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
                {/* Mobile Logo */}
                <div className="lg:hidden flex flex-col items-center mb-8">
                  <ElyraLogo size="lg" className="flex-col" />
                </div>

                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to Elyra</h2>
                  <p className="text-slate-500">Choose how you'd like to continue</p>
                </div>

                {/* Auth Options */}
                <div className="space-y-3">
                  {/* Google */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-gray-900 font-medium hover:bg-gray-100 transition-all shadow-lg"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-slate-600">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Email */}
                  <button
                    onClick={() => setMode('login')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-surface-800 text-white font-medium hover:bg-surface-700 transition-all border border-white/[0.08]"
                  >
                    <Mail size={18} />
                    Continue with Email
                  </button>

                  {/* Phone OTP */}
                  <button
                    onClick={() => setMode('otp')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-surface-800 text-white font-medium hover:bg-surface-700 transition-all border border-white/[0.08]"
                  >
                    <Phone size={18} />
                    Continue with Phone OTP
                  </button>

                  {/* Magic Link */}
                  <button
                    onClick={() => setMode('magic-link')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-transparent text-slate-400 font-medium hover:text-white hover:bg-white/[0.03] transition-all"
                  >
                    <Sparkles size={18} />
                    Get Magic Link
                  </button>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-brand-400 hover:text-brand-300 font-medium">
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
                <button
                  onClick={() => setMode('welcome')}
                  className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Sign in to Elyra</h2>
                <p className="text-slate-500 mb-6">Enter your credentials to continue</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-slate-400">Password</label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-xs text-brand-400 hover:text-brand-300"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                    ) : (
                      <>Sign In <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-slate-600">or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Social logins */}
                <div className="flex gap-3">
                  <button
                    onClick={handleGoogleLogin}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white hover:bg-surface-700 transition-all"
                  >
                    <GoogleIcon /> Google
                  </button>
                  <button
                    onClick={() => setMode('otp')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white hover:bg-surface-700 transition-all"
                  >
                    <Phone size={18} /> OTP
                  </button>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                  New to Elyra?{' '}
                  <button onClick={() => setMode('signup')} className="text-brand-400 hover:text-brand-300 font-medium">
                    Create an account
                  </button>
                </p>
              </motion.div>
            )}

            {/* Signup Form */}
            {mode === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button
                  onClick={() => setMode('welcome')}
                  className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                <p className="text-slate-500 mb-6">Start your 14-day free trial</p>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Company</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          placeholder="Acme Inc"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Work Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {password && (
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-all',
                              password.length >= i * 3
                                ? i <= 2 ? 'bg-red-500' : i === 3 ? 'bg-yellow-500' : 'bg-green-500'
                                : 'bg-slate-700'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {(error || success) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'text-sm rounded-xl px-4 py-3',
                        error
                          ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      )}
                    >
                      {error || success}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Creating account...</>
                    ) : (
                      <>Create Account <ArrowRight size={18} /></>
                    )}
                  </button>

                  <p className="text-xs text-slate-600 text-center">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-slate-400 hover:text-white">Terms of Service</a> and{' '}
                    <a href="#" className="text-slate-400 hover:text-white">Privacy Policy</a>
                  </p>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-brand-400 hover:text-brand-300 font-medium">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {/* OTP Entry */}
            {mode === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button
                  onClick={() => setMode('welcome')}
                  className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Enter your phone</h2>
                <p className="text-slate-500 mb-6">We'll send you a 6-digit verification code</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        <span>🇮🇳</span>
                        <span className="text-sm">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full pl-20 pr-4 py-3.5 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all text-lg tracking-wider"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phone.length < 10}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Sending OTP...</>
                    ) : (
                      <>Send OTP <MessageSquare size={18} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Verify OTP */}
            {mode === 'verify-otp' && (
              <motion.div
                key="verify-otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button
                  onClick={() => setMode('otp')}
                  className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Verify your phone</h2>
                <p className="text-slate-500 mb-6">
                  Enter the 6-digit code sent to +91 {phone}
                </p>

                <div className="space-y-6">
                  {/* OTP Input */}
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
                          digit
                            ? 'border-brand-500 ring-2 ring-brand-500/20'
                            : 'border-white/[0.08] focus:border-brand-500/50'
                        )}
                      />
                    ))}
                  </div>

                  {(error || success) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'text-sm rounded-xl px-4 py-3 text-center',
                        error
                          ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      )}
                    >
                      {error || success}
                    </motion.p>
                  )}

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.join('').length < 6}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                    ) : (
                      <>Verify & Continue <CheckCircle2 size={18} /></>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-slate-500 text-sm">
                        Resend OTP in <span className="text-white font-medium">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="text-brand-400 hover:text-brand-300 text-sm font-medium"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Magic Link */}
            {mode === 'magic-link' && (
              <motion.div
                key="magic-link"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button
                  onClick={() => setMode('welcome')}
                  className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Get magic link</h2>
                <p className="text-slate-500 mb-6">We'll email you a link to sign in instantly</p>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {(error || success) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'text-sm rounded-xl px-4 py-3',
                        error
                          ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      )}
                    >
                      {error || success}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Sending...</>
                    ) : (
                      <>Send Magic Link <Sparkles size={18} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Forgot Password */}
            {mode === 'forgot-password' && (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button
                  onClick={() => setMode('login')}
                  className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft size={16} /> Back to login
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Reset password</h2>
                <p className="text-slate-500 mb-6">Enter your email to receive a reset link</p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {(error || success) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'text-sm rounded-xl px-4 py-3',
                        error
                          ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      )}
                    >
                      {error || success}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Sending...</>
                    ) : (
                      <>Send Reset Link <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.05] space-y-3">
            <PoweredByLaali className="justify-center" />
            <p className="text-xs text-slate-600 text-center">
              © 2024 LAALI AI Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
