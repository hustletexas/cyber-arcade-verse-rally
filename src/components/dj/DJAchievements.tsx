import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { DJMilestone, DJ_BADGE_META } from '@/hooks/useDJAchievements';

interface DJAchievementsProps {
  milestones: DJMilestone[];
  mixCount: number;
  loading: boolean;
  isAuthenticated: boolean;
  onClaim: (type: string) => void;
}

const MILESTONE_ORDER = ['first_mix', 'ten_mixes', 'featured_mix'] as const;

export const DJAchievements: React.FC<DJAchievementsProps> = ({
  milestones, mixCount, loading, isAuthenticated, onClaim
}) => {
  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-neon-cyan/20 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-neon-cyan" />
        <span className="text-xs text-white/50">Loading achievements...</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-neon-purple/30 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-neon-pink" />
        <h3 className="text-sm font-bold text-neon-pink font-display tracking-wide">ON-CHAIN DJ BADGES</h3>
        <Badge variant="outline" className="border-neon-purple/40 text-neon-purple text-[9px] ml-auto">
          Soroban NFT
        </Badge>
      </div>

      <p className="text-[10px] text-white/40 mb-3">
        Earn badges by recording mixes. Claim as NFTs on Stellar via Soroban smart contracts.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MILESTONE_ORDER.map((type) => {
          const meta = DJ_BADGE_META[type];
          const milestone = milestones.find(m => m.milestone_type === type);
          const isReached = !!milestone?.claim_eligible;
          const isClaimed = !!milestone?.claimed;

          // Progress calculation
          let progress = 0;
          if (type === 'first_mix') progress = Math.min(mixCount, 1) * 100;
          else if (type === 'ten_mixes') progress = Math.min(mixCount / 10, 1) * 100;
          else if (type === 'featured_mix') progress = isReached ? 100 : 0;

          return (
            <div
              key={type}
              className={`p-3 rounded-lg border transition-all ${
                isClaimed
                  ? 'border-neon-green/40 bg-neon-green/5'
                  : isReached
                  ? 'border-neon-cyan/40 bg-neon-cyan/5 animate-pulse'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{meta.name}</p>
                  <p className="text-[10px] text-white/40">{meta.description}</p>
                </div>
                {isClaimed ? (
                  <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" />
                ) : isReached ? null : (
                  <Lock className="w-4 h-4 text-white/20 flex-shrink-0" />
                )}
              </div>

              <Progress value={progress} className="h-1 mb-2" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30">
                  {type === 'ten_mixes' ? `${mixCount}/10 mixes` : type === 'first_mix' ? `${Math.min(mixCount, 1)}/1 mix` : 'Featured'}
                </span>

                {isClaimed ? (
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-[9px]">
                    Claimed ✓
                  </Badge>
                ) : isReached && isAuthenticated ? (
                  <Button
                    size="sm"
                    onClick={() => onClaim(type)}
                    className="h-6 text-[10px] bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30"
                  >
                    Claim NFT
                  </Button>
                ) : (
                  <Badge variant="outline" className="border-white/10 text-white/30 text-[9px]">
                    Locked
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
