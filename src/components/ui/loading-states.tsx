import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';

// Loading Text with animated dots
interface LoadingTextProps {
  text?: string;
  className?: string;
}

export const LoadingText: React.FC<LoadingTextProps> = ({ 
  text = "Loading", 
  className 
}) => {
  return (
    <div className={cn("flex items-center gap-1 text-neon-cyan", className)}>
      <span className="font-mono">{text}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 bg-neon-cyan rounded-full animate-loading-dots"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

// Card Loading Skeleton
export const CardLoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("arcade-frame p-6 space-y-4", className)}>
      <Skeleton variant="cyber" className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton variant="shimmer" className="h-4 w-full" />
        <Skeleton variant="shimmer" className="h-4 w-5/6" />
        <Skeleton variant="shimmer" className="h-4 w-4/6" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="glow" className="h-10 w-24" />
        <Skeleton variant="cyber" className="h-10 w-20" />
      </div>
    </div>
  );
};

// Avatar Loading Skeleton
export const AvatarLoadingSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Skeleton 
      variant="glow" 
      className={cn("rounded-full", sizeClasses[size])} 
    />
  );
};

// List Loading Skeleton
export const ListLoadingSkeleton: React.FC<{ 
  items?: number; 
  className?: string;
}> = ({ items = 3, className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <AvatarLoadingSkeleton size="sm" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="cyber" className="h-4 w-2/3" />
            <Skeleton variant="shimmer" className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Game Loading Screen
export const GameLoadingScreen: React.FC<{ 
  title?: string;
  subtitle?: string;
  className?: string;
}> = ({ 
  title = "Loading Game", 
  subtitle = "Initializing cyber systems...",
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[300px] arcade-frame p-8",
      className
    )}>
      <LoadingSpinner size="xl" variant="orbit" className="mb-6" />
      <h3 className="text-xl font-display font-bold text-neon-cyan mb-2 glitch-text" data-text={title}>
        {title}
      </h3>
      <LoadingText text={subtitle} className="text-sm" />
      
      {/* Progress bar simulation */}
      <div className="w-full max-w-xs mt-6">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan animate-shimmer rounded-full w-full bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
};

// Button Loading State
export const ButtonLoading: React.FC<{
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
  className?: string;
}> = ({ children, isLoading, loadingText = "Loading...", className }) => {
  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded">
          <LoadingSpinner size="sm" className="mr-2" />
          <span className="text-sm font-mono">{loadingText}</span>
        </div>
      )}
      <div className={isLoading ? "opacity-50" : ""}>
        {children}
      </div>
    </div>
  );
};

// Table Loading Skeleton
export const TableLoadingSkeleton: React.FC<{
  columns?: number;
  rows?: number;
  className?: string;
}> = ({ columns = 4, rows = 5, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="cyber" className="h-6" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="shimmer" 
              className="h-4"
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Full Page Loading
export const FullPageLoading: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({ title = "Cyber City Arcade", subtitle = "Loading your gaming experience..." }) => {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="xl" variant="orbit" className="mx-auto mb-6" />
        <h1 className="text-3xl font-display font-bold text-neon-cyan mb-2 glitch-text" data-text={title}>
          {title}
        </h1>
        <LoadingText text={subtitle} className="text-lg" />
      </div>
    </div>
  );
};