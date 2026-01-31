import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Zap, Target, Ticket, Star } from 'lucide-react';
import { PlayerStats } from '@/types/cyber-match';

interface CyberMatchPlayerStatsProps {
  stats: PlayerStats | null;
}

export const CyberMatchPlayerStats: React.FC<CyberMatchPlayerStatsProps> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const statItems = [
    { icon: Trophy, label: 'Best Score', value: stats.bestScore.toLocaleString(), color: 'text-yellow-400' },
    { icon: Flame, label: 'Best Streak', value: stats.bestStreak.toString(), color: 'text-orange-400' },
    { icon: Zap, label: 'Total Matches', value: stats.totalMatches.toString(), color: 'text-neon-cyan' },
    { icon: Target, label: 'Total Runs', value: stats.totalRuns.toString(), color: 'text-neon-pink' },
    { icon: Star, label: 'Perfect Runs', value: stats.perfectRuns.toString(), color: 'text-purple-400' },
    { icon: Ticket, label: 'Tickets Earned', value: stats.ticketsEarned.toString(), color: 'text-green-400' },
  ];

  return (
    <Card className="mt-6 bg-black/40 backdrop-blur-md border-neon-pink/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-neon-pink">
          <Star className="w-5 h-5" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="bg-black/50 rounded-lg p-3 border border-gray-700/30 text-center hover:border-gray-600/50 transition-all"
            >
              <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
              <div className={`font-bold font-mono text-lg ${item.color}`}>
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
