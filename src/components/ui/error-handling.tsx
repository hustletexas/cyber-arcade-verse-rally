import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: Error | string | null;
  onRetry?: () => void;
  title?: string;
  variant?: 'default' | 'destructive';
  showIcon?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  title = "Something went wrong",
  variant = 'destructive',
  showIcon = true,
  className
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <Alert variant={variant} className={className}>
      {showIcon && <AlertTriangle className="h-4 w-4" />}
      <AlertDescription>
        <div className="flex flex-col gap-2">
          <strong className="text-sm font-medium">{title}</strong>
          <p className="text-sm opacity-90">{errorMessage}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-fit"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry, className }) => {
  return (
    <Card className={`arcade-frame ${className}`}>
      <CardContent className="text-center py-8">
        <WifiOff className="mx-auto mb-4 text-destructive" size={48} />
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Connection Lost
        </h3>
        <p className="text-muted-foreground mb-4">
          Unable to connect to the cyber network. Check your connection and try again.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <Wifi className="h-4 w-4 mr-2" />
            Reconnect
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface DataNotFoundProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const DataNotFound: React.FC<DataNotFoundProps> = ({
  title = "No Data Found",
  description = "The requested information is not available.",
  icon,
  action,
  className
}) => {
  return (
    <Card className={`arcade-frame ${className}`}>
      <CardContent className="text-center py-8">
        {icon ? (
          <div className="mb-4 text-muted-foreground">{icon}</div>
        ) : (
          <div className="text-4xl mb-4">🔍</div>
        )}
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface WalletErrorProps {
  error: string;
  onRetry?: () => void;
  onConnectWallet?: () => void;
  className?: string;
}

export const WalletError: React.FC<WalletErrorProps> = ({
  error,
  onRetry,
  onConnectWallet,
  className
}) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex flex-col gap-2">
          <strong className="text-sm font-medium">Wallet Error</strong>
          <p className="text-sm">{error}</p>
          <div className="flex gap-2">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {onConnectWallet && (
              <Button variant="outline" size="sm" onClick={onConnectWallet}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

interface AsyncErrorBoundaryState {
  error: Error | null;
}

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error) => void;
}

export class AsyncErrorBoundary extends React.Component<
  AsyncErrorBoundaryProps,
  AsyncErrorBoundaryState
> {
  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AsyncErrorBoundary caught error:', error, errorInfo);
    this.props.onError?.(error);
  }

  retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={this.retry}
          title="Unexpected Error"
        />
      );
    }

    return this.props.children;
  }
}