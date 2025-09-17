import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseErrorHandlerOptions {
  defaultErrorTitle?: string;
  showToast?: boolean;
  logErrors?: boolean;
}

interface ErrorState {
  error: Error | string | null;
  isError: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    defaultErrorTitle = "Something went wrong",
    showToast = true,
    logErrors = true
  } = options;

  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false
  });

  const handleError = useCallback((error: Error | string, customTitle?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const title = customTitle || defaultErrorTitle;

    if (logErrors) {
      console.error('Error handled:', error);
    }

    setErrorState({
      error: errorMessage,
      isError: true
    });

    if (showToast) {
      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [defaultErrorTitle, showToast, logErrors, toast]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false
    });
  }, []);

  const executeWithErrorHandling = useCallback(async (
    asyncFn: () => Promise<any>,
    customErrorTitle?: string
  ): Promise<any> => {
    try {
      clearError();
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, customErrorTitle);
      return null;
    }
  }, [handleError, clearError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    handleError,
    clearError,
    executeWithErrorHandling
  };
};

// Network-specific error handling
export const useNetworkErrorHandler = () => {
  const errorHandler = useErrorHandler({
    defaultErrorTitle: "Network Error"
  });

  const handleNetworkError = useCallback((error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check for common network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      errorHandler.handleError("Unable to connect to the network. Please check your internet connection.");
    } else if (errorMessage.includes('timeout')) {
      errorHandler.handleError("Request timed out. Please try again.");
    } else {
      errorHandler.handleError(error);
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleNetworkError
  };
};

// Wallet-specific error handling
export const useWalletErrorHandler = () => {
  const errorHandler = useErrorHandler({
    defaultErrorTitle: "Wallet Error"
  });

  const handleWalletError = useCallback((error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check for common wallet errors
    if (errorMessage.includes('User rejected')) {
      errorHandler.handleError("Transaction was cancelled by user.");
    } else if (errorMessage.includes('insufficient')) {
      errorHandler.handleError("Insufficient funds for this transaction.");
    } else if (errorMessage.includes('not connected')) {
      errorHandler.handleError("Please connect your wallet first.");
    } else if (errorMessage.includes('unsupported')) {
      errorHandler.handleError("This operation is not supported by your wallet.");
    } else {
      errorHandler.handleError(error);
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleWalletError
  };
};

// Database-specific error handling
export const useDatabaseErrorHandler = () => {
  const errorHandler = useErrorHandler({
    defaultErrorTitle: "Database Error"
  });

  const handleDatabaseError = useCallback((error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check for common database errors
    if (errorMessage.includes('PGRST116')) {
      // No rows returned - this is often expected
      return;
    } else if (errorMessage.includes('permission')) {
      errorHandler.handleError("You don't have permission to perform this action.");
    } else if (errorMessage.includes('duplicate')) {
      errorHandler.handleError("This item already exists.");
    } else if (errorMessage.includes('foreign key')) {
      errorHandler.handleError("Cannot complete operation due to data constraints.");
    } else {
      errorHandler.handleError("Database operation failed. Please try again.");
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleDatabaseError
  };
};