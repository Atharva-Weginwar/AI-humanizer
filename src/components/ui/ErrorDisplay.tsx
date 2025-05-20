import React from 'react';
import { AlertTriangle } from 'lucide-react';

type ErrorDisplayProps = {
  error: string | null;
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  // Map common error messages to user-friendly versions
  const friendlyErrorMessages: Record<string, string> = {
    "Insufficient credits": "You've run out of credits. Please upgrade your plan.",
    "Failed to submit document": "We couldn't process your request. Please try again.",
    "Document processing timed out": "The humanization process took too long. Please try again with a shorter text.",
    "Failed to check credits": "We couldn't verify your available credits. Please refresh the page."
  };
  
  const displayMessage = friendlyErrorMessages[error] || error;
  
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
      <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <p className="mt-1 text-sm text-red-700">{displayMessage}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;