
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully logged in to Cyber City Arcade",
        });
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username || email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Welcome to Cyber City Arcade! Check your email to verify your account.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Redirecting...",
        description: `Connecting with ${provider === 'google' ? 'Google' : 'Facebook'}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background vhs-glitch flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-cyan/10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Card className="arcade-frame w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center neon-glow mx-auto mb-4">
            <span className="text-2xl font-black">🕹️</span>
          </div>
          <CardTitle className="font-display text-2xl text-neon-cyan">
            {isLogin ? 'ENTER THE ARCADE' : 'JOIN THE ARCADE'}
          </CardTitle>
          <p className="text-neon-purple">
            {isLogin ? 'Welcome back, player!' : 'Create your account to start gaming'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading === 'google'}
              className="w-full cyber-button flex items-center gap-3"
              variant="outline"
            >
              {socialLoading === 'google' ? (
                '⏳ CONNECTING...'
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  CONTINUE WITH GOOGLE
                </>
              )}
            </Button>

            <Button
              onClick={() => handleSocialLogin('facebook')}
              disabled={socialLoading === 'facebook'}
              className="w-full cyber-button flex items-center gap-3"
              variant="outline"
            >
              {socialLoading === 'facebook' ? (
                '⏳ CONNECTING...'
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  CONTINUE WITH FACEBOOK
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-neon-cyan">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-black/50 border-neon-purple text-white"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neon-cyan">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-black/50 border-neon-purple text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neon-cyan">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-black/50 border-neon-purple text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full cyber-button"
            >
              {loading ? '⏳ LOADING...' : (isLogin ? '🎮 LOGIN' : '🚀 SIGN UP')}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-purple hover:text-neon-cyan"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
            >
              🏠 BACK TO ARCADE
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
