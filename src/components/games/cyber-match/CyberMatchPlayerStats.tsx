import React from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Flame, Zap, Target, Ticket, Star } from 'lucide-react';
import { PlayerStats } from '@/types/cyber-match';

interface CyberMatchPlayerStatsProps {
  stats: PlayerStats | null;
}

export const CyberMatchPlayerStats: React.FC<CyberMatchPlayerStatsProps> = ({ stats }) => {
  const statItems = stats ? [
    { icon: Trophy, label: 'Best Score', value: stats.bestScore.toLocaleString(), color: 'text-yellow-400' },
    { icon: Flame, label: 'Best Streak', value: stats.bestStreak.toString(), color: 'text-orange-400' },
    { icon: Zap, label: 'Total Matches', value: stats.totalMatches.toString(), color: 'text-neon-cyan' },
    { icon: Star, label: 'Perfect Clears', value: stats.perfectRuns.toString(), color: 'text-neon-green' },
  ] : [];

  return (
    <Card className="cyber-glass p-5">
      <h3 className="text-lg font-bold text-neon-cyan mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" /> Your Stats
      </h3>
      {stats ? (
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="text-center p-3 rounded-lg bg-black/30 hover:bg-black/40 transition-colors"
            >
              <div className={`flex items-center justify-center gap-1.5 text-2xl font-bold ${item.color}`}>
                <item.icon className="w-5 h-5" />
                {item.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Connect wallet to track stats</p>
        </div>
      )}
    </Card>
  );
};
