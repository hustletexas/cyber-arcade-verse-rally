
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-black text-white vhs-glitch flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-cyan/10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Card className="bg-gray-900/90 border border-neon-cyan/50 backdrop-blur-sm w-full max-w-md relative z-10 shadow-2xl shadow-neon-cyan/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-neon-pink/50">
            <span className="text-2xl font-black">🕹️</span>
          </div>
          <CardTitle className="font-display text-2xl text-neon-cyan">
            {isLogin ? 'ENTER THE ARCADE' : 'JOIN THE ARCADE'}
          </CardTitle>
          <p className="text-neon-purple">
            {isLogin ? 'Welcome back, player!' : 'Create your account to start gaming'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-neon-cyan font-bold">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-gray-800/80 border-neon-purple/50 text-white placeholder:text-gray-400 focus:border-neon-purple"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neon-cyan font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-gray-800/80 border-neon-purple/50 text-white placeholder:text-gray-400 focus:border-neon-purple"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neon-cyan font-bold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-gray-800/80 border-neon-purple/50 text-white placeholder:text-gray-400 focus:border-neon-purple"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold py-3 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-neon-cyan/50"
            >
              {loading ? '⏳ LOADING...' : (isLogin ? '🎮 LOGIN' : '🚀 SIGN UP')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-purple hover:text-neon-cyan hover:bg-neon-purple/20 font-bold"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-neon-green/20 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-bold transition-all duration-300"
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
