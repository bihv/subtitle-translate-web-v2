'use client';

import { useCallback } from 'react';
import { message, notification } from 'antd';

interface UseErrorHandlerProps {
  showNotification?: boolean;
  logErrors?: boolean;
}

export function useErrorHandler({
  showNotification = true,
  logErrors = true
}: UseErrorHandlerProps = {}) {

  // Handle error with simple notification wrapper (Retries are handled by Service layer)
  const handleError = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      errorMessage?: string;
      successMessage?: string;
      onError?: (error: any) => void;
    } = {}
  ): Promise<T | null> => {
    const {
      errorMessage = 'An error occurred',
      successMessage
    } = options;

    try {
      const result = await operation();

      if (successMessage) {
        message.success(successMessage);
      }

      return result;
    } catch (error: any) {
      const msg = error.message || errorMessage;

      // Log error
      if (logErrors) {
        console.error('Error in operation:', error);
      }

      // Show notification
      if (showNotification) {
        notification.error({
          message: 'Operation Failed',
          description: msg,
          duration: 5
        });
      }

      if (options.onError) {
        options.onError(error);
      }

      return null;
    }
  }, [showNotification, logErrors]);

  return {
    handleError
  };
}