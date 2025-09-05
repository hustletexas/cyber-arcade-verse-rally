// Production-safe logging utility
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors, but only detailed info in development
    if (process.env.NODE_ENV === 'development') {
      console.error(message, ...args);
    } else {
      console.error('An error occurred. Please contact support.');
    }
  }
};