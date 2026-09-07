import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Database,
  FileSpreadsheet,
  Link,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Rocket,
  Play,
  Loader2,
  ArrowRight,
  Zap,
  Shield,
  Phone,
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useStore } from '../store';
import { cn } from '../lib';

type Step = 'connect' | 'choose' | 'deploy';

interface DataSource {
  id: string;
  name: string;
  icon: typeof Database;
  description: string;
  color: string;
}

interface AgentPersonality {
  id: string;
  name: string;
  emoji: string;
  description: string;
  traits: string[];
  voice: string;
}

const DATA_SOURCES: DataSource[] = [
  { id: 'upload', name: 'Upload Files', icon: Upload, description: 'CSV, Excel, JSON, PDF', color: 'brand' },
  { id: 'database', name: 'Database', icon: Database, description: 'PostgreSQL, MySQL, MongoDB', color: 'emerald' },
  { id: 'sheets', name: 'Google Sheets', icon: FileSpreadsheet, description: 'Connect spreadsheets', color: 'green' },
  { id: 'api', name: 'REST API', icon: Link, description: 'Any REST endpoint', color: 'purple' },
];

const AGENT_PERSONALITIES: AgentPersonality[] = [
  {
    id: 'professional',
    name: 'Professional',
    emoji: '👔',
    description: 'Formal and business-like',
    traits: ['Concise', 'Formal', 'Efficient'],
    voice: 'Professional tone',
  },
  {
    id: 'friendly',
    name: 'Friendly',
    emoji: '😊',
    description: 'Warm and approachable',
    traits: ['Warm', 'Helpful', 'Patient'],
    voice: 'Conversational tone',
  },
  {
    id: 'expert',
    name: 'Expert',
    emoji: '🎓',
    description: 'Knowledgeable and detailed',
    traits: ['Detailed', 'Technical', 'Thorough'],
    voice: 'Authoritative tone',
  },
  {
    id: 'casual',
    name: 'Casual',
    emoji: '✌️',
    description: 'Relaxed and informal',
    traits: ['Relaxed', 'Fun', 'Easy-going'],
    voice: 'Casual tone',
  },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export function OnboardingPage() {
  const { updateProfile } = useAuthContext();
  const { setActivePage } = useStore();
  
  const [currentStep, setCurrentStep] = useState<Step>('connect');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string>('friendly');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [agentName, setAgentName] = useState('My Voice Agent');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  const steps: { id: Step; label: string; description: string }[] = [
    { id: 'connect', label: 'Connect', description: 'Connect your data source' },
    { id: 'choose', label: 'Choose', description: 'Pick your agent personality' },
    { id: 'deploy', label: 'Deploy', description: 'Launch your voice agent' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleNext = () => {
    if (currentStep === 'connect') {
      setCurrentStep('choose');
    } else if (currentStep === 'choose') {
      setCurrentStep('deploy');
    }
  };

  const handleBack = () => {
    if (currentStep === 'choose') {
      setCurrentStep('connect');
    } else if (currentStep === 'deploy') {
      setCurrentStep('choose');
    }
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(l => l !== code)
        : [...prev, code]
    );
  };

  const handleDeploy = async () => {
    setIsProcessing(true);
    
    // Simulate setup process
    const statuses = [
      'Analyzing your data structure...',
      'Generating SQL templates...',
      'Training response patterns...',
      'Configuring voice agent...',
      'Deploying to production...',
    ];

    for (const status of statuses) {
      setProcessingStatus(status);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsProcessing(false);
    setIsComplete(true);

    // Mark onboarding complete
    await updateProfile({ onboarding_completed: true });
  };

  const handleFinish = () => {
    setActivePage('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Header with LAALI branding */}
      <div className="text-center mb-12">
        {/* LAALI Logo SVG - Direct */}
        <div className="flex justify-center mb-6">
          <svg width="180" height="55" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="laali-grad-onboard" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#FF6B6B'}}/>
                <stop offset="50%" style={{stopColor:'#EE5A5A'}}/>
                <stop offset="100%" style={{stopColor:'#DC4444'}}/>
              </linearGradient>
              <filter id="glow-onboard" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#glow-onboard)">
              <path d="M8 8 L8 42 Q8 48 14 48 L32 48" stroke="url(#laali-grad-onboard)" strokeWidth="6" strokeLinecap="round" fill="none"/>
              <circle cx="20" cy="20" r="3" fill="#FF6B6B"/>
              <circle cx="32" cy="28" r="2.5" fill="#FF8585"/>
              <circle cx="26" cy="36" r="2" fill="#FFAAAA"/>
              <line x1="20" y1="20" x2="32" y2="28" stroke="#FF6B6B" strokeWidth="1" opacity="0.6"/>
              <line x1="32" y1="28" x2="26" y2="36" stroke="#FF6B6B" strokeWidth="1" opacity="0.6"/>
              <line x1="20" y1="20" x2="26" y2="36" stroke="#FF6B6B" strokeWidth="1" opacity="0.4"/>
            </g>
            <text x="48" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="700" fill="#FFFFFF" letterSpacing="1">
              LAALI
            </text>
            <text x="118" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="300" fill="#94A3B8" letterSpacing="1">
              AI
            </text>
            <text x="48" y="48" fontFamily="system-ui, -apple-system, sans-serif" fontSize="8" fontWeight="500" fill="#64748B" letterSpacing="2">
              CORPORATION
            </text>
          </svg>
        </div>
        
        {/* Main CCD Title */}
        <h1 className="text-4xl font-bold text-white mb-6">
          Voice AI in <span className="text-coral-400">3 Minutes</span>
        </h1>

        {/* Connect → Choose → Deploy - HIGHLIGHTED */}
        <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-coral-600/20 via-purple-600/20 to-emerald-600/20 border border-coral-500/30 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-coral-500/20 flex items-center justify-center">
              <Database size={20} className="text-coral-400" />
            </div>
            <span className="text-xl font-bold text-coral-400">Connect</span>
          </div>
          <ArrowRight size={24} className="text-slate-500" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Sparkles size={20} className="text-purple-400" />
            </div>
            <span className="text-xl font-bold text-purple-400">Choose</span>
          </div>
          <ArrowRight size={24} className="text-slate-500" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Rocket size={20} className="text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-emerald-400">Deploy</span>
          </div>
        </div>

        <p className="text-slate-400 text-lg">
          Connect your data, choose your AI agent, deploy to production
        </p>
      </div>

      {/* Progress Steps - Colored */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {steps.map((step, index) => {
          const stepColors = [
            { bg: 'bg-coral-500', ring: 'ring-coral-500/20', text: 'text-coral-400' },
            { bg: 'bg-purple-500', ring: 'ring-purple-500/20', text: 'text-purple-400' },
            { bg: 'bg-emerald-500', ring: 'ring-emerald-500/20', text: 'text-emerald-400' },
          ];
          const colors = stepColors[index];
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all',
                  index < currentStepIndex
                    ? `${colors.bg} text-white`
                    : index === currentStepIndex
                    ? `${colors.bg} text-white ring-4 ${colors.ring}`
                    : 'bg-surface-800 text-slate-500'
                )}>
                  {index < currentStepIndex ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <span className="text-lg">{index + 1}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className={cn(
                    'text-base font-bold',
                    index <= currentStepIndex ? colors.text : 'text-slate-500'
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-600">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-12 lg:w-24 h-1 mx-4 rounded-full',
                  index < currentStepIndex ? stepColors[index].bg : 'bg-surface-700'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Connect */}
        {currentStep === 'connect' && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Connect Your Data</h2>
              <p className="text-slate-500">Choose how you want to connect your business data</p>
            </div>

            {/* Data Source Options */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DATA_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  className={cn(
                    'p-6 rounded-2xl border-2 transition-all text-left',
                    selectedSource === source.id
                      ? 'bg-brand-600/10 border-brand-500 ring-4 ring-brand-500/10'
                      : 'bg-surface-800 border-white/[0.05] hover:border-white/[0.1]'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                    source.color === 'brand' && 'bg-brand-500/10',
                    source.color === 'emerald' && 'bg-emerald-500/10',
                    source.color === 'green' && 'bg-green-500/10',
                    source.color === 'purple' && 'bg-purple-500/10',
                  )}>
                    <source.icon size={24} className={cn(
                      source.color === 'brand' && 'text-brand-400',
                      source.color === 'emerald' && 'text-emerald-400',
                      source.color === 'green' && 'text-green-400',
                      source.color === 'purple' && 'text-purple-400',
                    )} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{source.name}</h3>
                  <p className="text-xs text-slate-500">{source.description}</p>
                </button>
              ))}
            </div>

            {/* File Upload (if selected) */}
            {selectedSource === 'upload' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6"
              >
                <label className="block">
                  <div className={cn(
                    'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
                    uploadedFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]'
                  )}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".csv,.xlsx,.json,.pdf"
                      className="hidden"
                    />
                    {uploadedFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
                        <p className="font-medium text-white">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={48} className="text-slate-500 mb-4" />
                        <p className="font-medium text-white">Drop your file here</p>
                        <p className="text-sm text-slate-500 mt-1">
                          or click to browse
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Choose */}
        {currentStep === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Choose Your Agent</h2>
              <p className="text-slate-500">Customize your voice agent's personality and voice</p>
            </div>

            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
                placeholder="My Voice Agent"
              />
            </div>

            {/* Personality Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">Personality</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {AGENT_PERSONALITIES.map((personality) => (
                  <button
                    key={personality.id}
                    onClick={() => setSelectedPersonality(personality.id)}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left',
                      selectedPersonality === personality.id
                        ? 'bg-brand-600/10 border-brand-500'
                        : 'bg-surface-800 border-white/[0.05] hover:border-white/[0.1]'
                    )}
                  >
                    <div className="text-3xl mb-3">{personality.emoji}</div>
                    <h3 className="font-semibold text-white mb-1">{personality.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">{personality.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {personality.traits.map(trait => (
                        <span
                          key={trait}
                          className="px-2 py-0.5 text-[10px] bg-surface-700 text-slate-400 rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={cn(
                      'px-4 py-2 rounded-xl border transition-all flex items-center gap-2',
                      selectedLanguages.includes(lang.code)
                        ? 'bg-brand-600/20 border-brand-500 text-white'
                        : 'bg-surface-800 border-white/[0.05] text-slate-400 hover:border-white/[0.1]'
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Deploy */}
        {currentStep === 'deploy' && !isComplete && (
          <motion.div
            key="deploy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Ready to Deploy</h2>
              <p className="text-slate-500">Review your configuration and launch</p>
            </div>

            {/* Summary */}
            <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6 space-y-4">
              <h3 className="font-semibold text-white mb-4">Configuration Summary</h3>
              
              <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                <span className="text-slate-400">Agent Name</span>
                <span className="text-white font-medium">{agentName}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                <span className="text-slate-400">Data Source</span>
                <span className="text-white font-medium capitalize">{selectedSource}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                <span className="text-slate-400">Personality</span>
                <span className="text-white font-medium capitalize">{selectedPersonality}</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-slate-400">Languages</span>
                <div className="flex gap-1">
                  {selectedLanguages.map(code => {
                    const lang = LANGUAGES.find(l => l.code === code);
                    return <span key={code}>{lang?.flag}</span>;
                  })}
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-surface-800/50 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">What happens next</h3>
              <div className="space-y-3">
                {[
                  { icon: Database, text: 'We analyze your data and create optimized SQL templates' },
                  { icon: Zap, text: 'Your agent learns response patterns for instant answers' },
                  { icon: Phone, text: 'A phone number is provisioned for your agent' },
                  { icon: Shield, text: 'Enterprise-grade security is configured' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                      <item.icon size={16} className="text-brand-400" />
                    </div>
                    <span className="text-sm text-slate-400">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4">
                  <Loader2 size={24} className="text-brand-400 animate-spin" />
                  <div>
                    <p className="font-medium text-white">Setting up your agent...</p>
                    <p className="text-sm text-brand-400">{processingStatus}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Success State */}
        {isComplete && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 size={40} className="text-emerald-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 Your Agent is Live!
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              {agentName} is now ready to handle calls. Test it out or go to your dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActivePage('voice')}
                className="px-6 py-3 rounded-xl bg-surface-800 border border-white/[0.1] text-white font-medium hover:bg-surface-700 transition-all flex items-center justify-center gap-2"
              >
                <Play size={18} />
                Test Agent
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {!isComplete && (
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/[0.05]">
          <button
            onClick={handleBack}
            disabled={currentStep === 'connect'}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2',
              currentStep === 'connect'
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <ChevronLeft size={18} />
            Back
          </button>

          {currentStep === 'deploy' ? (
            <button
              onClick={handleDeploy}
              disabled={isProcessing}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-600/20"
            >
              {isProcessing ? (
                <><Loader2 size={18} className="animate-spin" /> Deploying...</>
              ) : (
                <><Rocket size={18} /> Deploy Agent</>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentStep === 'connect' && !selectedSource}
              className={cn(
                'px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2',
                currentStep === 'connect' && !selectedSource
                  ? 'bg-surface-700 text-slate-500 cursor-not-allowed'
                  : 'bg-brand-600 text-white hover:bg-brand-500'
              )}
            >
              Continue
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
