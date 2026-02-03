import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Cancel = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-background to-orange-900/10" />

      <Card className="arcade-frame max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* Cancel Icon */}
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
            <div className="relative bg-gradient-to-br from-red-400 to-orange-600 p-4 rounded-full">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Cancelled
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Return to Arcade
              </Button>
            </Link>
            
            <Button 
              onClick={() => window.history.back()} 
              className="w-full gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cancel;
