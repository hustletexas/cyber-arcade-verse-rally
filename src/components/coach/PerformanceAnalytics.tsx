
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface UserProfile {
  favoriteGames: string[];
  skillLevel: string;
  playtime: number;
  recentPerformance: string;
  weakAreas: string[];
  strengths: string[];
}

interface PerformanceAnalyticsProps {
  userProfile: UserProfile;
}

export const PerformanceAnalytics = ({ userProfile }: PerformanceAnalyticsProps) => {
  const performanceData = {
    skillProgress: {
      strategy: 78,
      reflexes: 65,
      pattern: 82,
      mindset: 71,
      technical: 59,
      competitive: 73
    },
    gameStats: [
      { game: 'Tetris', sessions: 24, avgScore: 45200, improvement: '+12%', trend: 'up' },
      { game: 'Pac-Man', sessions: 18, avgScore: 28500, improvement: '+8%', trend: 'up' },
      { game: 'Galaga', sessions: 15, avgScore: 67800, improvement: '-3%', trend: 'down' }
    ],
    weeklyProgress: [
      { day: 'Mon', score: 85 },
      { day: 'Tue', score: 72 },
      { day: 'Wed', score: 90 },
      { day: 'Thu', score: 78 },
      { day: 'Fri', score: 95 },
      { day: 'Sat', score: 88 },
      { day: 'Sun', score: 92 }
    ],
    achievements: [
      { id: 'speed-demon', name: 'Speed Demon', description: 'Complete 100 reflex exercises', progress: 67 },
      { id: 'strategist', name: 'Master Strategist', description: 'Perfect strategy sessions', progress: 45 },
      { id: 'zen-master', name: 'Zen Master', description: 'Complete mindset training', progress: 89 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Skill Breakdown */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            📊 SKILL ANALYSIS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(performanceData.skillProgress).map(([skill, progress]) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-neon-purple">{skill}</span>
                  <span className="text-neon-green">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Performance */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            🎮 GAME PERFORMANCE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.gameStats.map((game) => (
              <Card key={game.game} className="holographic p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-neon-cyan">{game.game}</h4>
                    <p className="text-sm text-muted-foreground">
                      {game.sessions} sessions • Avg: {game.avgScore.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${
                      game.trend === 'up' 
                        ? 'bg-neon-green/20 text-neon-green border-neon-green' 
                        : 'bg-neon-pink/20 text-neon-pink border-neon-pink'
                    }`}>
                      {game.improvement} {game.trend === 'up' ? '📈' : '📉'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="vending-machine">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-pink">
            📈 WEEKLY PROGRESS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end h-32 mb-4">
            {performanceData.weeklyProgress.map((day) => (
              <div key={day.day} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-neon-cyan/30 border-t-2 border-neon-cyan rounded-t"
                  style={{ height: `${day.score}%` }}
                />
                <span className="text-xs mt-2 text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan">
              Average: 86% Performance
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-green">
              💪 STRENGTHS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userProfile.strengths.map((strength) => (
                <Badge key={strength} className="bg-neon-green/20 text-neon-green border-neon-green mr-2">
                  ✓ {strength}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-pink">
              🎯 FOCUS AREAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userProfile.weakAreas.map((area) => (
                <Badge key={area} className="bg-neon-pink/20 text-neon-pink border-neon-pink mr-2">
                  ⚠ {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Progress */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            🏆 ACHIEVEMENT PROGRESS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.achievements.map((achievement) => (
              <Card key={achievement.id} className="arcade-frame p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-neon-cyan">{achievement.name}</h4>
                    <span className="text-neon-green">{achievement.progress}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <Progress value={achievement.progress} className="h-2" />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
