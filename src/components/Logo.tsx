import { cn } from '../lib';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
  showTagline?: boolean;
}

// Elyra Logo - Voice AI Platform
export function ElyraLogo({ size = 'md', variant = 'full', className, showTagline = true }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 18, tagline: 6 },
    md: { icon: 40, text: 22, tagline: 8 },
    lg: { icon: 48, text: 28, tagline: 9 },
    xl: { icon: 64, text: 36, tagline: 11 },
  };

  const s = sizes[size];

  if (variant === 'icon') {
    return (
      <svg 
        width={s.icon} 
        height={s.icon} 
        viewBox="0 0 48 48" 
        fill="none" 
        className={cn('flex-shrink-0', className)}
      >
        <defs>
          <linearGradient id="elyra-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#6366F1"/>
          </linearGradient>
          <linearGradient id="elyra-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE"/>
            <stop offset="100%" stopColor="#6366F1"/>
          </linearGradient>
        </defs>
        
        <circle cx="24" cy="24" r="22" fill="url(#elyra-main)"/>
        <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        
        {/* Voice waves */}
        <rect x="14" y="16" width="3" height="16" rx="1.5" fill="white" opacity="0.9"/>
        <rect x="19" y="12" width="3" height="24" rx="1.5" fill="white"/>
        <rect x="24" y="18" width="3" height="12" rx="1.5" fill="white" opacity="0.85"/>
        <rect x="29" y="14" width="3" height="20" rx="1.5" fill="white" opacity="0.9"/>
        <rect x="34" y="20" width="3" height="8" rx="1.5" fill="white" opacity="0.7"/>
        
        {/* AI dot */}
        <circle cx="38" cy="12" r="4" fill="url(#elyra-accent)"/>
        <circle cx="38" cy="12" r="2" fill="white" opacity="0.9"/>
      </svg>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg 
        width={s.icon} 
        height={s.icon} 
        viewBox="0 0 48 48" 
        fill="none"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="elyra-main-full" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#6366F1"/>
          </linearGradient>
          <linearGradient id="elyra-accent-full" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE"/>
            <stop offset="100%" stopColor="#6366F1"/>
          </linearGradient>
        </defs>
        
        <circle cx="24" cy="24" r="22" fill="url(#elyra-main-full)"/>
        <rect x="14" y="16" width="3" height="16" rx="1.5" fill="white" opacity="0.9"/>
        <rect x="19" y="12" width="3" height="24" rx="1.5" fill="white"/>
        <rect x="24" y="18" width="3" height="12" rx="1.5" fill="white" opacity="0.85"/>
        <rect x="29" y="14" width="3" height="20" rx="1.5" fill="white" opacity="0.9"/>
        <rect x="34" y="20" width="3" height="8" rx="1.5" fill="white" opacity="0.7"/>
        <circle cx="38" cy="12" r="4" fill="url(#elyra-accent-full)"/>
        <circle cx="38" cy="12" r="2" fill="white" opacity="0.9"/>
      </svg>
      
      <div>
        <p 
          className="font-semibold text-white leading-none"
          style={{ fontSize: s.text }}
        >
          elyra
        </p>
        {showTagline && (
          <p 
            className="text-slate-500 mt-0.5 tracking-wider uppercase"
            style={{ fontSize: s.tagline }}
          >
            Voice AI Platform
          </p>
        )}
      </div>
    </div>
  );
}

// LAALI AI Corporation Logo
export function LaaliLogo({ size = 'md', variant = 'full', className }: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 36 },
    md: { width: 160, height: 48 },
    lg: { width: 200, height: 60 },
    xl: { width: 260, height: 78 },
  };

  const s = sizes[size];

  if (variant === 'icon') {
    return (
      <svg 
        width={s.height} 
        height={s.height} 
        viewBox="0 0 48 48" 
        fill="none"
        className={cn('flex-shrink-0', className)}
      >
        <defs>
          <linearGradient id="laali-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B"/>
            <stop offset="50%" stopColor="#EE5A5A"/>
            <stop offset="100%" stopColor="#DC4444"/>
          </linearGradient>
        </defs>
        
        {/* L shape */}
        <path 
          d="M10 8 L10 34 Q10 40 16 40 L38 40" 
          stroke="url(#laali-grad)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          fill="none"
        />
        
        {/* Neural dots */}
        <circle cx="22" cy="18" r="4" fill="#FF6B6B"/>
        <circle cx="34" cy="26" r="3" fill="#FF8585"/>
        <circle cx="28" cy="32" r="2.5" fill="#FFAAAA"/>
        
        {/* Connections */}
        <line x1="22" y1="18" x2="34" y2="26" stroke="#FF6B6B" strokeWidth="1.5" opacity="0.5"/>
        <line x1="34" y1="26" x2="28" y2="32" stroke="#FF6B6B" strokeWidth="1.5" opacity="0.5"/>
        <line x1="22" y1="18" x2="28" y2="32" stroke="#FF6B6B" strokeWidth="1" opacity="0.3"/>
      </svg>
    );
  }

  return (
    <svg 
      width={s.width} 
      height={s.height} 
      viewBox="0 0 200 60" 
      fill="none"
      className={cn('flex-shrink-0', className)}
    >
      <defs>
        <linearGradient id="laali-gradient-full" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B"/>
          <stop offset="50%" stopColor="#EE5A5A"/>
          <stop offset="100%" stopColor="#DC4444"/>
        </linearGradient>
      </defs>
      
      {/* Logo Mark */}
      <g>
        <path 
          d="M8 8 L8 42 Q8 48 14 48 L32 48" 
          stroke="url(#laali-gradient-full)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          fill="none"
        />
        <circle cx="20" cy="20" r="3" fill="#FF6B6B"/>
        <circle cx="32" cy="28" r="2.5" fill="#FF8585"/>
        <circle cx="26" cy="36" r="2" fill="#FFAAAA"/>
        <line x1="20" y1="20" x2="32" y2="28" stroke="#FF6B6B" strokeWidth="1" opacity="0.6"/>
        <line x1="32" y1="28" x2="26" y2="36" stroke="#FF6B6B" strokeWidth="1" opacity="0.6"/>
        <line x1="20" y1="20" x2="26" y2="36" stroke="#FF6B6B" strokeWidth="1" opacity="0.4"/>
      </g>
      
      {/* Company Name */}
      <text x="48" y="32" fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="700" fill="#FFFFFF" letterSpacing="1">
        LAALI
      </text>
      <text x="118" y="32" fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="300" fill="#94A3B8" letterSpacing="1">
        AI
      </text>
      
      {/* Tagline */}
      <text x="48" y="48" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="500" fill="#64748B" letterSpacing="2">
        CORPORATION
      </text>
    </svg>
  );
}

// Combined badge - "Elyra by LAALI AI"
export function PoweredByLaali({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-slate-500 text-xs', className)}>
      <span>Powered by</span>
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="laali-mini" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B"/>
              <stop offset="100%" stopColor="#DC4444"/>
            </linearGradient>
          </defs>
          <path d="M10 8 L10 34 Q10 40 16 40 L38 40" stroke="url(#laali-mini)" strokeWidth="6" strokeLinecap="round" fill="none"/>
          <circle cx="22" cy="18" r="3" fill="#FF6B6B"/>
          <circle cx="32" cy="26" r="2" fill="#FF8585"/>
        </svg>
        <span className="font-medium text-slate-400">LAALI AI</span>
      </div>
    </div>
  );
}

// Animated logo for loading states
export function ElyraLogoAnimated({ size = 'lg' }: { size?: 'md' | 'lg' | 'xl' }) {
  const iconSize = size === 'md' ? 48 : size === 'lg' ? 64 : 80;
  
  return (
    <div className="relative">
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 48 48" 
        fill="none"
        className="animate-pulse"
      >
        <defs>
          <linearGradient id="elyra-anim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#6366F1"/>
          </linearGradient>
        </defs>
        
        <circle cx="24" cy="24" r="22" fill="url(#elyra-anim)"/>
        
        {/* Animated voice bars */}
        <rect x="14" y="16" width="3" height="16" rx="1.5" fill="white" opacity="0.9" className="animate-[pulse_1s_ease-in-out_infinite]"/>
        <rect x="19" y="12" width="3" height="24" rx="1.5" fill="white" className="animate-[pulse_1s_ease-in-out_infinite_0.1s]"/>
        <rect x="24" y="18" width="3" height="12" rx="1.5" fill="white" opacity="0.85" className="animate-[pulse_1s_ease-in-out_infinite_0.2s]"/>
        <rect x="29" y="14" width="3" height="20" rx="1.5" fill="white" opacity="0.9" className="animate-[pulse_1s_ease-in-out_infinite_0.3s]"/>
        <rect x="34" y="20" width="3" height="8" rx="1.5" fill="white" opacity="0.7" className="animate-[pulse_1s_ease-in-out_infinite_0.4s]"/>
      </svg>
      
      {/* Glow ring */}
      <div 
        className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping"
        style={{ animationDuration: '2s' }}
      />
    </div>
  );
}
