import React from 'react';
import { TopBar } from '@/components/TopBar';
import { CartDrawer } from '@/components/CartDrawer';
import { ArrowLeft, Gamepad2, Trophy, BarChart3, Flame, Globe, Users, Shield, Star, Zap, Target, Rocket, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EsportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateAccount = async () => {
    if (user) {
      toast({ title: "You're already signed in!", description: "Head to tournaments to start competing." });
      navigate('/tournaments');
    } else {
      // Prompt sign up via Supabase Auth
      const email = window.prompt('Enter your email to create an account:');
      if (email) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Check your email!", description: "We sent you a magic link to sign in." });
        }
      }
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar />
      <CartDrawer />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Arcade
        </Button>

        {/* Hero Header */}
        <div className="arcade-frame text-center py-12 mb-10">
          <h1 className="font-display text-4xl md:text-5xl text-accent mb-3">
            CYBER CITY ESPORTS
          </h1>
          <p className="text-xl text-foreground/90 mb-2">All Ages Competitive Gaming Arena</p>
          <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1">
            Built on Stellar Blockchain
          </Badge>
        </div>

        {/* What Is Esports */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" /> What Is Esports?
          </h2>
          <p className="text-muted-foreground mb-4">
            Esports (electronic sports) is organized competitive video gaming. Just like basketball or football, players compete in structured matches, tournaments, and leagues. Matches are skill-based and require strategy, reaction time, teamwork, and focus.
          </p>
          <p className="text-foreground/80 mb-4">At Cyber City Arcade, esports is:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Competitive', 'Skill-based', 'Safe for all ages', 'Community driven', 'Educational & strategic'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-foreground/80 mt-4">We combine gaming with structure, leadership, and digital skill-building.</p>
        </section>

        {/* What Is Cyber City Esports */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" /> What Is Cyber City Esports?
          </h2>
          <p className="text-muted-foreground mb-6">
            Cyber City Esports is our official competitive gaming division inside the app. Players can:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Gamepad2, text: 'Compete in skill-based matches' },
              { icon: Trophy, text: 'Enter tournaments' },
              { icon: BarChart3, text: 'Climb weekly leaderboards' },
              { icon: Flame, text: 'Earn recognition and rewards' },
              { icon: Globe, text: 'Join a growing gaming community' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Icon className="w-5 h-5 text-accent shrink-0" />
                <span className="text-foreground/90">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-4">Our arena is designed for beginners and advanced players.</p>
        </section>

        {/* All Ages Welcome */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> All Ages Welcome
          </h2>
          <p className="text-muted-foreground mb-4">Cyber City Esports is designed to be:</p>
          <div className="grid grid-cols-2 gap-3">
            {['Family-friendly', 'Structured', 'Competitive but respectful', 'Safe and moderated'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-foreground/80 mt-4">We promote positive competition, good sportsmanship, and community growth.</p>
        </section>

        {/* Built on Stellar Blockchain */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Built on Stellar Blockchain
          </h2>
          <p className="text-muted-foreground mb-4">Cyber City Arcade uses blockchain technology for:</p>
          <ul className="space-y-2 text-muted-foreground mb-4">
            {[
              'Transparent leaderboard tracking',
              'Secure player records',
              'Verified tournament results',
              'Future digital rewards integration',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-foreground/80">
            We use blockchain for integrity and transparency — not gambling. All competitions are skill-based.
          </p>
        </section>

        {/* How To Join */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" /> How To Join
          </h2>
          <p className="text-muted-foreground mb-6">Joining Cyber City Esports is simple:</p>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Create an Account', desc: 'Sign up inside the Cyber City Arcade app.' },
              { step: 2, title: 'Choose Your Mode', desc: 'Free Play (practice), Ranked Play (competitive leaderboard), or Tournament Mode.' },
              { step: 3, title: 'Compete', desc: 'Play matches, improve your skills, and climb the rankings.' },
              { step: 4, title: 'Enter Tournaments', desc: 'When tournaments open, register directly inside the app.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-display text-primary">
                  {step}
                </div>
                <div>
                  <h3 className="font-display text-foreground/90">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How Tournaments Work */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> How Tournaments Work
          </h2>
          <ul className="space-y-2 text-muted-foreground mb-6">
            {[
              'Skill-based matches',
              'Structured brackets',
              'Admin-reported results',
              'Transparent leaderboard updates',
              'Clear prize structure',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-foreground/80">
            No raffles. No gambling mechanics. No chance-based outcomes. <strong>Winners are determined by skill.</strong>
          </div>
        </section>

        {/* What Can You Win */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> What Can You Win?
          </h2>
          <p className="text-muted-foreground mb-4">Depending on the event:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Merch credits',
              'Digital badges',
              'Recognition on leaderboard',
              'Season Pass upgrades',
              'Sponsor prizes',
              'Future in-app credits',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-muted-foreground">
                <Star className="w-4 h-4 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-foreground/80 mt-4 text-sm">Prizes are structured and clearly defined before each tournament.</p>
        </section>

        {/* Leaderboards */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Leaderboards
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Weekly Top 10', icon: '🔥' },
              { label: 'Monthly Champions', icon: '🔥' },
              { label: 'Seasonal MVP', icon: '🔥' },
            ].map(({ label, icon }) => (
              <Card key={label} className="arcade-frame text-center">
                <CardContent className="pt-6">
                  <span className="text-2xl">{icon}</span>
                  <p className="font-display text-foreground/90 mt-2">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-muted-foreground mt-4 text-center">Climb the ranks and earn your place in the Cyber Arena.</p>
        </section>

        {/* Our Mission */}
        <section className="arcade-frame p-8 mb-8">
          <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Our Mission
          </h2>
          <p className="text-muted-foreground mb-4">Cyber City Arcade blends:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Gaming & esports',
              'Education & skill-building',
              'Community engagement',
              'Responsible use of technology',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-foreground/80">
                <Zap className="w-4 h-4 text-accent shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-foreground/80 mt-4">
            We are building more than a game — we are building the future of competitive digital arenas.
          </p>
        </section>

        {/* CTA */}
        <section className="arcade-frame p-10 text-center mb-8">
          <h2 className="font-display text-3xl text-accent mb-6 flex items-center justify-center gap-2">
            <Rocket className="w-7 h-7 text-primary" /> Ready To Enter The Arena?
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button onClick={handleCreateAccount} className="bg-primary hover:bg-primary/80 text-primary-foreground font-display">
              {user ? 'Go To Tournaments' : 'Create Your Account'}
            </Button>
            <Button onClick={() => navigate('/tournaments')} variant="outline" className="border-accent text-accent hover:bg-accent/10 font-display">
              View Tournaments
            </Button>
          </div>
          <p className="text-muted-foreground font-display text-sm">
            Cyber City Esports — All Ages. Skill-Based. Built for the Future.
          </p>
        </section>
      </main>
    </div>
  );
};

export default EsportsPage;
