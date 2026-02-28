import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-background to-emerald-900/20" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <Card className={`arcade-frame max-w-md w-full transition-all duration-700 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className={`relative inline-flex mb-6 transition-all duration-500 delay-200 ${animate ? 'scale-100' : 'scale-0'}`}>
            <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-2 neon-text">
            Payment Successful!
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your transaction has been completed successfully.
          </p>

          {/* Session ID */}
          {sessionId && (
            <div className="bg-muted/50 rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
              <p className="text-sm font-mono text-foreground truncate">
                {sessionId.substring(0, 20)}...
              </p>
            </div>
          )}

          {/* CTA */}
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            <Button className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <ArrowLeft className="w-4 h-4" />
              Return to Arcade
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
