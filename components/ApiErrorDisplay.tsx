"use client";

import React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiErrorDisplayProps {
  error: string;
  retryAction?: () => void;
}

export default function ApiErrorDisplay({ 
  error, 
  retryAction 
}: ApiErrorDisplayProps) {
  // Format common API error messages to be more user-friendly
  const getReadableErrorMessage = (error: string) => {
    if (error.includes("429")) {
      return "Rate limit exceeded. Please wait a moment before trying again.";
    }
    if (error.includes("403")) {
      return "API access forbidden. Please check your API key.";
    }
    if (error.includes("401")) {
      return "Unauthorized API access. Your API key might be invalid.";
    }
    if (error.includes("500")) {
      return "Server error from Gemini API. Please try again later.";
    }
    
    return error;
  };

  const readableError = getReadableErrorMessage(error);

  return (
    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded flex items-start gap-2 text-sm">
      <AlertTriangle className="text-rose-500 dark:text-rose-400 h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-rose-700 dark:text-rose-300 text-xs font-medium">Translation Error</p>
        <p className="text-rose-600 dark:text-rose-400 text-xs mt-0.5">{readableError}</p>
        {retryAction && (
          <Button 
            size="sm"
            variant="ghost"
            onClick={retryAction}
            className="mt-1 h-7 px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center gap-1"
          >
            <RotateCw className="h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
} 