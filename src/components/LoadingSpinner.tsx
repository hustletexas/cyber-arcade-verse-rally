import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'pulse' | 'orbit' | 'matrix';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} ${className} relative`}>
        <div className="absolute inset-0 rounded-full bg-neon-cyan animate-ping opacity-75"></div>
        <div className="relative rounded-full bg-neon-cyan animate-pulse"></div>
      </div>
    );
  }

  if (variant === 'orbit') {
    return (
      <div className={`${sizeClasses[size]} ${className} relative animate-spin`}>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-pink border-r-neon-cyan"></div>
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-neon-purple border-l-neon-green animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.75s' }}></div>
      </div>
    );
  }

  if (variant === 'matrix') {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i}
              className="w-1 h-1 bg-neon-green rounded-full animate-pulse"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <div className="w-full h-full border-2 border-muted/20 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-t-neon-cyan rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-b-neon-pink rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
    </div>
  );
};