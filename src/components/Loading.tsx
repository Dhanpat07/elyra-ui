import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { cn } from '../lib';

// Full page loading screen
export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-surface-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-brand-600/40">
            <Zap size={28} className="text-white" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl bg-brand-500/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold">Elyra</p>
          <p className="text-xs text-slate-500">{message}</p>
        </div>
      </motion.div>
    </div>
  );
}

// Inline spinner
export function Spinner({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-brand-400',
        sizeClasses[size],
        className
      )} 
    />
  );
}

// Button loading state
export function ButtonLoader({ 
  loading, 
  children,
  loadingText = 'Loading...',
}: { 
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}) {
  if (loading) {
    return (
      <span className="flex items-center gap-2">
        <Loader2 size={16} className="animate-spin" />
        {loadingText}
      </span>
    );
  }
  return <>{children}</>;
}

// Skeleton loader for content
export function Skeleton({ 
  className,
  variant = 'default',
}: { 
  className?: string;
  variant?: 'default' | 'circle' | 'text';
}) {
  return (
    <div 
      className={cn(
        'animate-pulse bg-surface-700',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'default' && 'rounded-xl',
        className
      )} 
    />
  );
}

// Skeleton card
export function SkeletonCard() {
  return (
    <div className="bg-surface-800 rounded-2xl border border-white/[0.05] p-6">
      <div className="flex items-start gap-4">
        <Skeleton variant="circle" className="w-12 h-12" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
      </div>
    </div>
  );
}

// Loading overlay for sections
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-surface-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        {message && <p className="text-sm text-slate-400">{message}</p>}
      </div>
    </div>
  );
}

// Dots loader
export function DotsLoader() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-brand-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Progress loader
export function ProgressLoader({ 
  progress,
  message,
}: { 
  progress: number;
  message?: string;
}) {
  return (
    <div className="w-full">
      {message && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-400">{message}</p>
          <p className="text-sm font-medium text-white">{progress}%</p>
        </div>
      )}
      <div className="w-full bg-surface-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
