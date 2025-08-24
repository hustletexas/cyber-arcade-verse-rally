
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoachingSession } from './coach/CoachingSession';
import { PerformanceAnalytics } from './coach/PerformanceAnalytics';
import { StrategyTips } from './coach/StrategyTips';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const AIGamingCoach = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [coachLevel, setCoachLevel] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);

  // Mock user gaming profile
  const userProfile = {
    favoriteGames: ['Tetris', 'Pac-Man', 'Galaga'],
    skillLevel: 'Intermediate',
    playtime: 127,
    recentPerformance: 'Improving',
    weakAreas: ['Speed', 'Combo Timing'],
    strengths: ['Pattern Recognition', 'Strategic Thinking']
  };

  const coachingAreas = [
    {
      id: 'strategy',
      name: 'Game Strategy',
      icon: '🎯',
      description: 'Learn optimal strategies for different game scenarios',
      difficulty: 'Beginner'
    },
    {
      id: 'reflexes',
      name: 'Reflex Training',
      icon: '⚡',
      description: 'Improve reaction time and hand-eye coordination',
      difficulty: 'Intermediate'
    },
    {
      id: 'pattern',
      name: 'Pattern Recognition',
      icon: '🧩',
      description: 'Master complex patterns and sequences',
      difficulty: 'Advanced'
    },
    {
      id: 'mindset',
      name: 'Gaming Psychology',
      icon: '🧠',
      description: 'Mental preparation and focus techniques',
      difficulty: 'Intermediate'
    },
    {
      id: 'competitive',
      name: 'Tournament Prep',
      icon: '🏆',
      description: 'Prepare for competitive gaming events',
      difficulty: 'Advanced'
    },
    {
      id: 'technical',
      name: 'Technical Skills',
      icon: '⚙️',
      description: 'Advanced techniques and frame-perfect inputs',
      difficulty: 'Expert'
    }
  ];

  const startCoachingSession = (areaId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access AI coaching sessions",
        variant: "destructive",
      });
      return;
    }
    
    setActiveSession(areaId);
    setTotalSessions(prev => prev + 1);
    
    toast({
      title: "Coaching Session Started! 🎮",
      description: "Your AI coach is ready to help improve your skills",
    });
  };

  const endSession = () => {
    setActiveSession(null);
    toast({
      title: "Session Complete! ⭐",
      description: "Great work! Your progress has been saved.",
    });
  };

  if (activeSession) {
    const area = coachingAreas.find(a => a.id === activeSession);
    return (
      <CoachingSession
        area={area!}
        userProfile={userProfile}
        onEndSession={endSession}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center">
            🤖 AI GAMING COACH
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Personalized training • Performance analysis • Strategy optimization
          </p>
          
          {user && (
            <div className="flex justify-center gap-4 mt-4">
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                Coach Level {coachLevel}
              </Badge>
              <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple">
                {totalSessions} Sessions Complete
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {user ? (
        <Tabs defaultValue="coaching" className="w-full">
          <TabsList className="grid w-full grid-cols-3 arcade-frame p-2">
            <TabsTrigger value="coaching" className="cyber-button">🎮 COACHING</TabsTrigger>
            <TabsTrigger value="analytics" className="cyber-button">📊 ANALYTICS</TabsTrigger>
            <TabsTrigger value="tips" className="cyber-button">💡 TIPS</TabsTrigger>
          </TabsList>

          <TabsContent value="coaching" className="space-y-6 mt-6">
            {/* User Profile Overview */}
            <Card className="holographic">
              <CardHeader>
                <CardTitle className="font-display text-xl text-neon-pink">
                  👤 YOUR GAMING PROFILE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-bold text-neon-cyan">{userProfile.skillLevel}</div>
                    <p className="text-xs text-muted-foreground">Skill Level</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏱️</div>
                    <div className="font-bold text-neon-purple">{userProfile.playtime}h</div>
                    <p className="text-xs text-muted-foreground">Total Playtime</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📈</div>
                    <div className="font-bold text-neon-green">{userProfile.recentPerformance}</div>
                    <p className="text-xs text-muted-foreground">Recent Trend</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="font-bold text-neon-pink">{userProfile.favoriteGames.length}</div>
                    <p className="text-xs text-muted-foreground">Games Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Areas */}
            <Card className="arcade-frame">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-neon-purple">
                  🎯 CHOOSE YOUR TRAINING FOCUS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coachingAreas.map((area) => (
                    <Card 
                      key={area.id} 
                      className="holographic hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => startCoachingSession(area.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{area.icon}</div>
                        <h3 className="font-bold text-lg text-neon-cyan mb-2">{area.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{area.description}</p>
                        <Badge className={`${
                          area.difficulty === 'Beginner' ? 'bg-neon-green/20 text-neon-green border-neon-green' :
                          area.difficulty === 'Intermediate' ? 'bg-neon-purple/20 text-neon-purple border-neon-purple' :
                          area.difficulty === 'Advanced' ? 'bg-neon-pink/20 text-neon-pink border-neon-pink' :
                          'bg-neon-cyan/20 text-neon-cyan border-neon-cyan'
                        } mb-3`}>
                          {area.difficulty}
                        </Badge>
                        <Button className="cyber-button w-full" size="sm">
                          Start Session
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <PerformanceAnalytics userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="tips" className="space-y-6 mt-6">
            <StrategyTips userProfile={userProfile} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="arcade-frame border-neon-pink/30">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-neon-pink mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-4">
              Sign in to access personalized AI coaching, performance tracking, and strategy tips
            </p>
            <Button className="cyber-button">
              🚀 Sign In
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
