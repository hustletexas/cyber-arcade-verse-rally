import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, PlayerStats } from '@/types/cyber-sequence';
import { Trophy, Target, Flame, Zap, Award, Ticket } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';

interface CyberSequenceLeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerRank?: number;
  isLoading?: boolean;
}

export const CyberSequenceLeaderboard: React.FC<CyberSequenceLeaderboardProps> = ({
  entries,
  currentPlayerRank,
  isLoading = false,
}) => {
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const stellarAddress = primaryWallet?.address;
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (isWalletConnected && stellarAddress) {
      fetchPlayerStats();
    } else {
      setPlayerStats(null);
    }
  }, [isWalletConnected, stellarAddress]);

  const fetchPlayerStats = async () => {
    if (!stellarAddress) return;
    setStatsLoading(true);
    try {
      // Fetch from daily_limits or create default stats
      const { data } = await supabase
        .from('daily_limits')
        .select('*')
        .eq('user_id', stellarAddress)
        .single();

      // For now, show default stats - can be enhanced with a dedicated stats table
      setPlayerStats({
        bestScore: 0,
        bestSequence: 0,
        bestStreak: 0,
        totalRuns: data?.plays_today || 0,
        perfectRuns: 0,
        ticketsEarned: 0,
      });
    } catch (error) {
      setPlayerStats({
        bestScore: 0,
        bestSequence: 0,
        bestStreak: 0,
        totalRuns: 0,
        perfectRuns: 0,
        ticketsEarned: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sequence-glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Daily Leaderboard
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Player Stats Section */}
      <div className="sequence-glass-panel p-5">
        <h3 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Your Stats
          {isWalletConnected && (
            <span className="ml-auto text-xs text-neon-green flex items-center gap-1">
              <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              Live
            </span>
          )}
        </h3>
        
        {isWalletConnected ? (
          statsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-neon-cyan/20">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  Best Score
                </div>
                <div className="text-xl font-bold text-white">
                  {playerStats?.bestScore?.toLocaleString() || 0}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Target className="w-3 h-3 text-purple-400" />
                  Best Sequence
                </div>
                <div className="text-xl font-bold text-white">
                  {playerStats?.bestSequence || 0}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-orange-500/20">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  Best Streak
                </div>
                <div className="text-xl font-bold text-white">
                  {playerStats?.bestStreak || 0}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-neon-green/20">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Award className="w-3 h-3 text-neon-green" />
                  Total Runs
                </div>
                <div className="text-xl font-bold text-white">
                  {playerStats?.totalRuns || 0}
                </div>
              </div>
            </div>
          )
        ) : (
          <p className="text-gray-400 text-sm text-center py-3">
            Connect wallet to see your stats
          </p>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="sequence-glass-panel p-5">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Daily Leaderboard
        </h3>
        
        {entries.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No scores yet today. Be the first!
          </p>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase mb-2 px-3">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Player</span>
              <span className="col-span-2 text-right">Score</span>
              <span className="col-span-2 text-right">Seq</span>
              <span className="col-span-2 text-right">Streak</span>
            </div>

            <div className="sequence-leaderboard">
              {entries.map((entry, idx) => {
                const isCurrentPlayer = currentPlayerRank === entry.rank;
                
                return (
                  <div
                    key={entry.rank}
                    className={`sequence-leaderboard-entry ${isCurrentPlayer ? 'ring-2 ring-cyan-400' : ''}`}
                  >
                    <div className="grid grid-cols-12 gap-2 items-center w-full">
                      <span className={`col-span-1 font-bold ${
                        idx === 0 ? 'text-yellow-400' :
                        idx === 1 ? 'text-gray-300' :
                        idx === 2 ? 'text-orange-400' :
                        'text-gray-500'
                      }`}>
                        {entry.rank}
                      </span>
                      
                      <span className="col-span-5 text-sm text-gray-300 truncate">
                        {entry.displayName}
                        {isCurrentPlayer && <span className="ml-2 text-cyan-400">(You)</span>}
                      </span>
                      
                      <span className="col-span-2 text-right text-sm text-white font-medium">
                        {entry.score.toLocaleString()}
                      </span>
                      
                      <span className="col-span-2 text-right text-sm text-purple-400 flex items-center justify-end gap-1">
                        <Target className="w-3 h-3" />
                        {entry.max_sequence}
                      </span>
                      
                      <span className="col-span-2 text-right text-sm text-orange-400 flex items-center justify-end gap-1">
                        <Flame className="w-3 h-3" />
                        {entry.best_streak}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
