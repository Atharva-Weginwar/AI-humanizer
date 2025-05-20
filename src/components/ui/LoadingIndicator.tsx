import React from 'react';

type LoadingIndicatorProps = {
  size?: 'small' | 'medium' | 'large';
  message?: string;
};

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium',
  message = 'Humanizing your text...'
}) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-blue-500 border-blue-200`}></div>
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default LoadingIndicator;