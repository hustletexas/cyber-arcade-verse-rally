import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative">
        <div className="w-full h-full border-2 border-neon-cyan/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-t-neon-cyan rounded-full animate-spin"></div>
      </div>
    </div>
  );
};