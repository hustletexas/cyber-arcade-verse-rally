
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioMilestone, RadioStreakData } from '@/hooks/useRadioStreaks';
import { Flame, Trophy, Clock, Star, ChevronDown, ChevronUp, Gift } from 'lucide-react';

interface RadioRewardsProps {
  streakData: RadioStreakData;
  milestones: RadioMilestone[];
  isConnected: boolean;
  isPlaying: boolean;
  formatListenTime: (seconds: number) => string;
  onClaimMilestone: (milestone: RadioMilestone) => void;
  onConnectWallet: () => void;
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  diamond: '#b9f2ff',
};

const TIER_ICONS: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  diamond: '💎',
};

export const RadioRewards: React.FC<RadioRewardsProps> = ({
  streakData,
  milestones,
  isConnected,
  isPlaying,
  formatListenTime,
  onClaimMilestone,
  onConnectWallet,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!isConnected) {
    return (
      <div className="mt-4 p-3 rounded-lg border border-neon-purple/30 bg-black/40 text-center">
        <p className="text-xs text-neon-purple mb-2">
          ⛓️ Connect your Stellar wallet to earn listen streak rewards
        </p>
        <Button
          onClick={onConnectWallet}
          size="sm"
          className="text-xs"
          style={{
            background: 'linear-gradient(45deg, #00ffcc, #0088aa)',
            border: '1px solid #00ffcc',
          }}
        >
          Connect & Start Earning
        </Button>
      </div>
    );
  }

  const tierColor = TIER_COLORS[streakData.tier] || TIER_COLORS.bronze;
  const claimable = milestones.filter(m => !m.claimed && m.progress >= m.target);

  return (
    <div className="mt-4 space-y-3">
      {/* Streak Stats Bar */}
      <div
        className="p-3 rounded-lg border bg-black/40"
        style={{ borderColor: `${tierColor}50` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TIER_ICONS[streakData.tier]}</span>
            <span className="text-xs font-bold uppercase" style={{ color: tierColor }}>
              {streakData.tier} Listener
            </span>
            {isPlaying && (
              <Badge className="bg-neon-green/20 text-neon-green text-xs animate-pulse border-none">
                ● LIVE
              </Badge>
            )}
          </div>
          <Button
            onClick={() => setExpanded(!expanded)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-neon-cyan"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1">
              <Flame size={12} className="text-orange-400" />
              <span className="text-sm font-bold text-neon-pink">{streakData.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Trophy size={12} className="text-yellow-400" />
              <span className="text-sm font-bold text-neon-cyan">{streakData.longestStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Star size={12} className="text-neon-purple" />
              <span className="text-sm font-bold text-neon-green">{streakData.totalDays}</span>
            </div>
            <p className="text-xs text-muted-foreground">Days</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Clock size={12} className="text-neon-cyan" />
              <span className="text-sm font-bold text-neon-purple">
                {formatListenTime(streakData.totalSeconds + streakData.sessionSeconds)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
        </div>

        {isPlaying && streakData.sessionSeconds > 0 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-neon-green">
              🎵 Session: {formatListenTime(streakData.sessionSeconds)} • Syncs every 5 min
            </p>
          </div>
        )}
      </div>

      {/* Claimable rewards notification */}
      {claimable.length > 0 && (
        <div className="p-2 rounded-lg border border-neon-green/50 bg-neon-green/10 animate-pulse">
          <div className="flex items-center gap-2">
            <Gift size={14} className="text-neon-green" />
            <p className="text-xs text-neon-green font-bold">
              {claimable.length} milestone{claimable.length > 1 ? 's' : ''} ready to claim!
            </p>
          </div>
        </div>
      )}

      {/* Milestones Grid */}
      {expanded && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="text-xs font-bold text-neon-cyan uppercase tracking-wider">
            ⛓️ Stellar Milestones
          </h4>
          {milestones.map((m) => {
            const pct = m.target > 0 ? (m.progress / m.target) * 100 : 0;
            const canClaim = !m.claimed && m.progress >= m.target;

            return (
              <div
                key={m.id}
                className={`p-2 rounded-lg border transition-all ${
                  m.claimed
                    ? 'border-neon-green/30 bg-neon-green/5 opacity-70'
                    : canClaim
                    ? 'border-neon-pink/50 bg-neon-pink/10 shadow-lg shadow-neon-pink/20'
                    : 'border-neon-purple/20 bg-black/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{m.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-neon-cyan">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.rewardDescription}</p>
                    </div>
                  </div>
                  {m.claimed ? (
                    <Badge className="bg-neon-green/20 text-neon-green text-xs border-none">
                      ✓ Claimed
                    </Badge>
                  ) : canClaim ? (
                    <Button
                      onClick={() => onClaimMilestone(m)}
                      size="sm"
                      className="h-6 text-xs px-2"
                      style={{
                        background: 'linear-gradient(45deg, #ff00ff, #aa0088)',
                        border: '1px solid #ff00ff',
                      }}
                    >
                      Claim
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {m.progress}/{m.target}
                    </span>
                  )}
                </div>
                {!m.claimed && (
                  <Progress value={pct} className="h-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
