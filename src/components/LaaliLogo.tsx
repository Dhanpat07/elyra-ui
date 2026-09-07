import { motion } from 'framer-motion';
import { cn } from '../lib';

/**
 * LAALI Logo Components
 * 
 * Official LAALI AI Corporation branding
 * Golden star with sparkles - representing AI brilliance and warmth
 */

// Brand Colors - Golden/Yellow theme
const BRAND = {
  gold: '#F5C842',       // Primary golden yellow
  goldLight: '#FFD966',  // Lighter shade
  goldDark: '#D4A82C',   // Darker shade
};

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'wordmark';
  showTagline?: boolean;
  className?: string;
  animated?: boolean;
}

const SIZES = {
  xs: { icon: 24, text: 14, tagline: 8 },
  sm: { icon: 32, text: 18, tagline: 10 },
  md: { icon: 40, text: 24, tagline: 12 },
  lg: { icon: 56, text: 32, tagline: 14 },
  xl: { icon: 72, text: 42, tagline: 16 },
};

/**
 * LAALI Icon - Uses the official laali.logo.png
 */
function LaaliIcon({ size = 40, animated = false }: { size?: number; animated?: boolean }) {
  const Wrapper = animated ? motion.img : 'img';
  const animationProps = animated ? {
    animate: { 
      scale: [1, 1.05, 1],
    },
    transition: { 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  } : {};

  return (
    <Wrapper
      src="/laali-logo.png"
      alt="LAALI"
      width={size}
      height={size}
      className="flex-shrink-0"
      style={{ objectFit: 'contain' }}
      {...animationProps}
    />
  );
}

/**
 * LAALI Wordmark - Clean typography
 */
function LaaliWordmark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <span 
      className={cn("font-bold tracking-wide", className)}
      style={{ 
        fontSize: size,
        color: '#FFFFFF',
      }}
    >
      LAALI
    </span>
  );
}

/**
 * Main LAALI Logo Component
 */
export function LaaliLogo({ 
  size = 'md', 
  variant = 'full', 
  showTagline = false,
  className,
  animated = false 
}: LogoProps) {
  const config = SIZES[size];
  
  if (variant === 'icon') {
    return <LaaliIcon size={config.icon} animated={animated} />;
  }
  
  if (variant === 'wordmark') {
    return (
      <div className={cn("flex flex-col", className)}>
        <LaaliWordmark size={config.text} />
        {showTagline && (
          <span 
            className="text-slate-500 font-medium"
            style={{ fontSize: config.tagline }}
          >
            Voice AI with warmth
          </span>
        )}
      </div>
    );
  }
  
  // Full logo - icon + wordmark
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LaaliIcon size={config.icon} animated={animated} />
      <div className="flex flex-col">
        <LaaliWordmark size={config.text} />
        {showTagline && (
          <span 
            className="text-slate-500 font-medium -mt-0.5"
            style={{ fontSize: config.tagline }}
          >
            Voice AI with warmth
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Animated LAALI Logo - Simple rotating logo for loading screens
 */
export function LaaliLogoAnimated({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeConfig = {
    sm: { logo: 48, text: 'text-lg' },
    md: { logo: 64, text: 'text-2xl' },
    lg: { logo: 80, text: 'text-3xl' },
  };
  
  const config = sizeConfig[size];
  
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Simple rotating logo */}
      <motion.img 
        src="/laali-logo.png" 
        alt="LAALI" 
        style={{ width: config.logo, height: config.logo }}
        className="object-contain"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Brand name */}
      <div className="flex flex-col items-center gap-1">
        <h1 className={`${config.text} font-bold text-gold-500`}>
          LAALI AI
        </h1>
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

/**
 * CCD Steps - Connect, Choose, Deploy
 * Premium animated version with flowing particles and glowing effects
 */
export function CCDSteps({ currentStep }: { currentStep?: 1 | 2 | 3 }) {
  const steps = [
    { 
      num: 1, 
      label: 'Connect', 
      desc: 'Your Data', 
      color: BRAND.gold,
      bgColor: 'rgba(245, 166, 35, 0.15)',
    },
    { 
      num: 2, 
      label: 'Choose', 
      desc: 'Personality', 
      color: '#A855F7',
      bgColor: 'rgba(168, 85, 247, 0.15)',
    },
    { 
      num: 3, 
      label: 'Deploy', 
      desc: 'Go Live', 
      color: '#22C55E',
      bgColor: 'rgba(34, 197, 94, 0.15)',
    },
  ];

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {steps.map((step, i) => {
        const isActive = currentStep ? currentStep >= step.num : true;
        const isCurrent = currentStep === step.num;
        
        return (
          <div key={step.num} className="flex items-center">
            {/* Step Card */}
            <motion.div 
              className="flex flex-col items-center px-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.5, ease: "easeOut" }}
            >
              {/* Animated Icon Container */}
              <motion.div 
                className="relative mb-3"
                whileHover={{ scale: 1.1 }}
                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Outer glow ring - pulsing */}
                <motion.div
                  className="absolute -inset-3 rounded-2xl blur-md"
                  style={{ backgroundColor: step.color }}
                  animate={{ 
                    opacity: [0.2, 0.4, 0.2],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
                
                {/* Icon container */}
                <motion.div 
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2"
                  style={{ 
                    backgroundColor: step.bgColor,
                    borderColor: `${step.color}60`,
                    boxShadow: `0 0 30px ${step.color}40, inset 0 0 20px ${step.color}10`,
                  }}
                >
                  {/* Step-specific animated icon */}
                  {step.num === 1 && <ConnectIcon color={step.color} active={isActive} />}
                  {step.num === 2 && <ChooseIcon color={step.color} active={isActive} />}
                  {step.num === 3 && <DeployIcon color={step.color} active={isActive} />}
                </motion.div>

                {/* Step number badge */}
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-surface-900"
                  style={{ backgroundColor: step.color }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                >
                  {step.num}
                </motion.div>
              </motion.div>
              
              {/* Labels */}
              <motion.span 
                className="text-sm font-bold tracking-wide"
                style={{ color: step.color }}
              >
                {step.label}
              </motion.span>
              <span className="text-xs text-slate-400 mt-0.5">{step.desc}</span>
            </motion.div>
            
            {/* Animated connector */}
            {i < steps.length - 1 && (
              <div className="relative w-12 h-1 mx-1 self-start mt-8">
                {/* Base line with gradient */}
                <div 
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{ 
                    background: `linear-gradient(90deg, ${step.color}, ${steps[i + 1].color})` 
                  }}
                />
                
                {/* Animated energy pulse */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{ 
                    background: `radial-gradient(circle, ${step.color} 0%, transparent 70%)`,
                    boxShadow: `0 0 10px ${step.color}`
                  }}
                  animate={{ 
                    x: [-4, 44, -4],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.6
                  }}
                />
                
                {/* Second trailing particle */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: steps[i + 1].color }}
                  animate={{ 
                    x: [-4, 44, -4],
                    opacity: [0, 0.7, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.6 + 0.3
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Animated Connect Icon - Database with data flow
function ConnectIcon({ color, active }: { color: string; active: boolean }) {
  return (
    <motion.svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      {/* Database layers */}
      <motion.ellipse 
        cx="12" cy="5" rx="7" ry="2.5" 
        stroke={color} 
        strokeWidth="1.5"
        fill={`${color}30`}
        animate={active ? { scaleX: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <path d="M5 5v4c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V5" stroke={color} strokeWidth="1.5" />
      <ellipse cx="12" cy="9" rx="7" ry="2.5" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M5 9v4c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V9" stroke={color} strokeWidth="1.5" />
      <ellipse cx="12" cy="13" rx="7" ry="2.5" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M5 13v4c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-4" stroke={color} strokeWidth="1.5" />
      
      {/* Animated data dots rising */}
      <motion.circle 
        cx="9" 
        cy="17"
        r="1" 
        fill={color}
        initial={{ opacity: 0.3 }}
        animate={active ? { 
          y: [0, -10, 0], 
          opacity: [0, 1, 0] 
        } : { opacity: 0.3 }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      />
      <motion.circle 
        cx="12" 
        cy="17"
        r="1" 
        fill={color}
        initial={{ opacity: 0.3 }}
        animate={active ? { 
          y: [0, -10, 0], 
          opacity: [0, 1, 0] 
        } : { opacity: 0.3 }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle 
        cx="15" 
        cy="17"
        r="1" 
        fill={color}
        initial={{ opacity: 0.3 }}
        animate={active ? { 
          y: [0, -10, 0], 
          opacity: [0, 1, 0] 
        } : { opacity: 0.3 }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      />
    </motion.svg>
  );
}

// Animated Choose Icon - Sparkle/AI brain
function ChooseIcon({ color, active }: { color: string; active: boolean }) {
  return (
    <motion.svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      {/* Central star/sparkle */}
      <motion.path
        d="M12 2L13.5 9L20 10L13.5 11L12 18L10.5 11L4 10L10.5 9L12 2Z"
        fill={`${color}40`}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        animate={active ? { 
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: 'center' }}
      />
      
      {/* Orbiting sparkles */}
      <motion.circle 
        cx="18" cy="4" r="1.5" 
        fill={color}
        animate={active ? { 
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      />
      <motion.circle 
        cx="20" cy="12" r="1" 
        fill={color}
        animate={active ? { 
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      />
      <motion.circle 
        cx="6" cy="18" r="1.5" 
        fill={color}
        animate={active ? { 
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
      />
      <motion.circle 
        cx="4" cy="8" r="1" 
        fill={color}
        animate={active ? { 
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
      />

      {/* Small bottom star */}
      <motion.path
        d="M12 19L12.5 21L14 21.5L12.5 22L12 24L11.5 22L10 21.5L11.5 21L12 19Z"
        fill={color}
        animate={active ? { opacity: [0.3, 1, 0.3] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.svg>
  );
}

// Animated Deploy Icon - Rocket launch
function DeployIcon({ color, active }: { color: string; active: boolean }) {
  return (
    <motion.svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none"
      animate={active ? { y: [0, -2, 0] } : {}}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Rocket body */}
      <motion.path
        d="M12 2C12 2 7 7 7 13C7 15 8 17 9 18L7 22L12 19L17 22L15 18C16 17 17 15 17 13C17 7 12 2 12 2Z"
        stroke={color}
        strokeWidth="1.5"
        fill={`${color}25`}
        strokeLinejoin="round"
      />
      
      {/* Window */}
      <circle cx="12" cy="10" r="2.5" fill={`${color}50`} stroke={color} strokeWidth="1" />
      <circle cx="12" cy="10" r="1" fill={color} />
      
      {/* Animated flames */}
      <motion.path
        d="M9 18L12 23L15 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={active ? { 
          opacity: [0.5, 1, 0.5],
          scaleY: [0.8, 1.3, 0.8],
          y: [0, 2, 0]
        } : {}}
        transition={{ duration: 0.2, repeat: Infinity }}
        style={{ transformOrigin: 'center top' }}
      />
      
      {/* Flame particles */}
      <motion.circle
        cx="10" cy="20" r="1.5"
        fill={color}
        animate={active ? { 
          opacity: [0, 1, 0],
          y: [0, 4, 8],
          scale: [1, 0.5, 0]
        } : {}}
        transition={{ duration: 0.4, repeat: Infinity }}
      />
      <motion.circle
        cx="14" cy="20" r="1.5"
        fill={color}
        animate={active ? { 
          opacity: [0, 1, 0],
          y: [0, 4, 8],
          scale: [1, 0.5, 0]
        } : {}}
        transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
      />
      <motion.circle
        cx="12" cy="21" r="1"
        fill={color}
        animate={active ? { 
          opacity: [0, 1, 0],
          y: [0, 5, 10],
          scale: [1, 0.3, 0]
        } : {}}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.05 }}
      />
    </motion.svg>
  );
}

/**
 * CCD Badge - Compact version
 */
export function CCDBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-purple-500/10 border border-yellow-500/20">
      <span className="text-xs font-bold text-yellow-400">Connect</span>
      <span className="text-slate-600">·</span>
      <span className="text-xs font-bold text-purple-400">Choose</span>
      <span className="text-slate-600">·</span>
      <span className="text-xs font-bold text-emerald-400">Deploy</span>
    </div>
  );
}

/**
 * LAALI Tagline
 */
export function LaaliTagline({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  return (
    <p className={cn(sizes[size], 'text-slate-400')}>
      <span className="text-yellow-400 font-semibold">Voice AI</span> with warmth
    </p>
  );
}

/**
 * Powered by LAALI
 */
export function PoweredByLaali({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-slate-500", className)}>
      <span className="text-xs">Powered by</span>
      <LaaliLogo size="xs" variant="full" />
    </div>
  );
}

/**
 * LAALI Footer
 */
export function LaaliFooter() {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-slate-600 text-xs">
      <LaaliIcon size={16} />
      <span>
        Built with ❤️ by <span className="text-yellow-400 font-medium">LAALI AI Corporation</span>
      </span>
    </div>
  );
}

export default LaaliLogo;
