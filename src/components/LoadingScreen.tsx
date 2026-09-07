import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadComplete?: () => void;
  duration?: number;
}

const LoadingScreen = ({ onLoadComplete, duration = 1500 }: LoadingScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!onLoadComplete) return;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onLoadComplete, 500); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onLoadComplete, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple/20 rounded-full blur-2xl animate-pulse delay-300" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Rotating Logo */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-r from-primary via-purple to-primary animate-spin-slow opacity-30 blur-md" 
               style={{ animationDuration: '3s' }} />
          
          {/* Rotating ring */}
          <div className="absolute inset-0 w-28 h-28">
            <svg className="w-full h-full animate-spin-slow" style={{ animationDuration: '2s' }} viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="70 200"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(45, 93%, 58%)" />
                  <stop offset="50%" stopColor="hsl(262, 83%, 58%)" />
                  <stop offset="100%" stopColor="hsl(45, 93%, 58%)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Logo container with pulse */}
          <div className="w-28 h-28 flex items-center justify-center">
            <div className="relative">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
              
              {/* Rotating logo */}
              <img 
                src="/laali-logo.png" 
                alt="LAALI" 
                className="relative w-16 h-16 object-contain animate-spin-slow"
                style={{ animationDuration: '4s' }}
              />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-gold-light to-primary bg-clip-text text-transparent animate-pulse">
            LAALI AI
          </h1>
          <p className="text-sm text-muted-foreground">Voice AI with warmth</p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

// Inline loading spinner with rotation
export const LoadingSpinner = ({ 
  size = "md",
  showLogo = false 
}: { 
  size?: "sm" | "md" | "lg";
  showLogo?: boolean;
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const logoSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  if (showLogo) {
    return (
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Rotating ring */}
        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1s' }} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(45, 93%, 58%)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="70 200"
            opacity="0.3"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#spinGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="70 200"
          />
          <defs>
            <linearGradient id="spinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 93%, 58%)" />
              <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center logo */}
        <img 
          src="/laali-logo.png" 
          alt="" 
          className={`${logoSizes[size]} object-contain`}
        />
      </div>
    );
  }

  // Simple rotating ring
  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg className="w-full h-full animate-spin" style={{ animationDuration: '1s' }} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(45, 93%, 58%)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="70 200"
          opacity="0.2"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(45, 93%, 58%)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="70 200"
          className="origin-center"
        />
      </svg>
    </div>
  );
};

// Full page loading with rotating logo
export const PageLoading = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" showLogo />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

export default LoadingScreen;
