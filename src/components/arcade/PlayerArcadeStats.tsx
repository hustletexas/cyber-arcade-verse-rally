
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PlayerStats {
  totalGamesPlayed: number;
  totalScore: number;
  currentLevel: number;
  tokensEarned: number;
  achievements: string[];
}

interface PlayerArcadeStatsProps {
  stats: PlayerStats;
}

export const PlayerArcadeStats: React.FC<PlayerArcadeStatsProps> = ({ stats }) => {
  const currentLevelProgress = ((stats.totalScore % 10000) / 10000) * 100;
  const nextLevelScore = (stats.currentLevel * 10000) - (stats.totalScore % 10000);

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-xl text-neon-cyan">
          🎮 Player Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-lg font-bold text-neon-green">{stats.totalGamesPlayed}</div>
            <p className="text-xs text-muted-foreground">Games Played</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-lg font-bold text-neon-purple">{stats.totalScore.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Score</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-lg font-bold text-neon-pink">{stats.currentLevel}</div>
            <p className="text-xs text-muted-foreground">Player Level</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-lg font-bold text-neon-cyan">{stats.tokensEarned}</div>
            <p className="text-xs text-muted-foreground">CCTR Earned</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Level {stats.currentLevel} Progress</span>
            <span className="text-neon-cyan">{nextLevelScore} points to Level {stats.currentLevel + 1}</span>
          </div>
          <Progress value={currentLevelProgress} className="h-2" />
        </div>

        {/* Recent Achievements */}
        {stats.achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-neon-green">Recent Achievements:</h4>
            <div className="flex flex-wrap gap-2">
              {stats.achievements.map((achievement, index) => (
                <Badge key={index} className="bg-yellow-500/20 text-yellow-400 border-yellow-400">
                  🏅 {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
