import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TriviaUserStats, TriviaDailyLeaderboardEntry } from '@/types/cyber-trivia';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Flame, Zap, Trophy, Target, Ticket, Clock, Gamepad2, Film, Calendar, Crown, FlaskConical, Dumbbell, Tv, ToyBrick } from 'lucide-react';
import { motion } from 'framer-motion';

type TriviaCategory = 'Gaming' | 'Entertainment' | 'Science' | 'Sports' | 'Cartoon' | 'Toys';

interface CyberTriviaHomeProps {
  onStartFreePlay: (category: TriviaCategory, playMode: 'free') => void;
  onStartDailyRun: () => void;
  userStats: TriviaUserStats | null;
  dailyLeaderboard: TriviaDailyLeaderboardEntry[];
  allTimeLeaderboard: TriviaDailyLeaderboardEntry[];
  loading: boolean;
}

const categories: { name: TriviaCategory; icon: React.ElementType; color: string; borderColor: string; tags: string[]; description: string }[] = [
  { name: 'Gaming', icon: Gamepad2, color: 'text-neon-cyan', borderColor: 'border-neon-cyan/30 hover:border-neon-cyan/50', tags: ['Retro', 'Esports', 'Console'], description: 'Video games, esports, retro classics & gaming culture' },
  { name: 'Entertainment', icon: Film, color: 'text-purple-400', borderColor: 'border-purple-400/30 hover:border-purple-400/50', tags: ['Movies', 'Music', 'TV'], description: 'Movies, TV shows, music & pop culture' },
  { name: 'Science', icon: FlaskConical, color: 'text-green-400', borderColor: 'border-green-400/30 hover:border-green-400/50', tags: ['Physics', 'Space', 'Biology'], description: 'Physics, chemistry, biology, space & technology' },
  { name: 'Sports', icon: Dumbbell, color: 'text-orange-400', borderColor: 'border-orange-400/30 hover:border-orange-400/50', tags: ['Football', 'Basketball', 'Soccer'], description: 'Football, basketball, soccer, Olympics & athletics' },
  { name: 'Cartoon', icon: Tv, color: 'text-pink-400', borderColor: 'border-pink-400/30 hover:border-pink-400/50', tags: ['Classic', 'Anime', 'Modern'], description: 'Classic cartoons, anime, animated series & characters' },
  { name: 'Toys', icon: ToyBrick, color: 'text-blue-400', borderColor: 'border-blue-400/30 hover:border-blue-400/50', tags: ['LEGO', 'Retro', 'Collectibles'], description: 'LEGO, action figures, dolls, board games & collectibles' },
];

export const CyberTriviaHome: React.FC<CyberTriviaHomeProps> = ({
  onStartFreePlay,
  userStats,
  dailyLeaderboard,
  allTimeLeaderboard,
  loading
}) => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const userRank = dailyLeaderboard.findIndex(e => e.user_id === primaryWallet?.address) + 1;

  return (
    <div className="relative z-10 space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="cyber-title font-display md:text-5xl lg:text-6xl text-neon-cyan mb-4 text-7xl" data-text="CYBER TRIVIA">
          CYBER TRIVIA
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Test your knowledge • Build streaks • Earn rewards
        </p>

        {/* Live Activity Ticker */}
        <div className="mt-6 py-2 border-y border-neon-cyan/20 overflow-hidden">
          <div className="activity-ticker">
            <div className="activity-ticker-content text-sm text-neon-cyan/70">
              🔥 Player #42 just hit a 15-streak! • 🎁 Legendary Matrix Effect unlocked • 
              🏆 New daily high score: 12,450 pts • ⚡ 234 players online now • 
              🎮 Gaming category trending • 🔥 Player #42 just hit a 15-streak!
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.name} className={`cyber-glass p-5 transition-all duration-300 ${cat.borderColor}`}>
              <div className="text-center space-y-3">
                <div className={`w-14 h-14 mx-auto rounded-full bg-black/30 flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${cat.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{cat.name.toUpperCase()}</h3>
                <p className="text-gray-400 text-xs">{cat.description}</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {cat.tags.map(tag => (
                    <Badge key={tag} variant="outline" className={`${cat.color} border-current/50 text-xs`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={() => onStartFreePlay(cat.name, 'free')}
                  disabled={loading}
                  variant="outline"
                  className={`w-full py-5 font-bold ${cat.color} border-current/50 bg-transparent hover:bg-white/5`}
                >
                  {loading ? 'Loading...' : 'PLAY NOW'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stats & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
        {/* User Stats */}
        <Card className="cyber-glass p-5">
          <h3 className="text-lg font-bold text-neon-cyan mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" /> Your Stats
            {isWalletConnected && (
              <span className="ml-auto text-xs text-neon-green flex items-center gap-1">
                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                Live
              </span>
            )}
          </h3>
          {isWalletConnected ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-black/30">
                <div className="text-2xl font-bold text-white">{userStats?.best_streak ?? 0}</div>
                <div className="text-xs text-gray-500">Best Streak</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-black/30">
                <div className="text-2xl font-bold text-neon-green">{userStats ? `${userStats.accuracy.toFixed(1)}%` : '0%'}</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-black/30">
                <div className="text-2xl font-bold text-purple-400">{userStats?.total_runs ?? 0}</div>
                <div className="text-xs text-gray-500">Total Runs</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-black/30">
                <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                  <Ticket className="w-4 h-4" /> {userStats?.tickets_balance ?? 0}
                </div>
                <div className="text-xs text-gray-500">Tickets</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Connect wallet to track stats</p>
            </div>
          )}
        </Card>

        {/* Leaderboard */}
        <Card className="cyber-glass-purple p-6">
          <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> Leaderboard
          </h3>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/30 mb-4">
              <TabsTrigger value="today" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                <Calendar className="w-4 h-4 mr-1" /> Today
              </TabsTrigger>
              <TabsTrigger value="alltime" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                <Crown className="w-4 h-4 mr-1" /> All Time
              </TabsTrigger>
            </TabsList>
            <TabsContent value="today">
              {dailyLeaderboard.length > 0 ? (
                <div className="space-y-2">
                  {dailyLeaderboard.slice(0, 5).map((entry, idx) => (
                    <div key={entry.user_id || idx} className={`flex items-center justify-between p-2 rounded ${entry.user_id === primaryWallet?.address ? 'leaderboard-you' : 'bg-black/20'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-500'}`}>#{idx + 1}</span>
                        <span className="text-sm text-gray-300">{entry.user_id ? `${entry.user_id.slice(0, 6)}...${entry.user_id.slice(-4)}` : 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neon-cyan font-bold">{entry.score}</span>
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400">{entry.best_streak}</span>
                      </div>
                    </div>
                  ))}
                  {userRank > 5 && userRank <= 100 && (
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex items-center justify-between p-2 rounded leaderboard-you">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-neon-cyan">#{userRank}</span>
                          <span className="text-sm text-gray-300">You</span>
                        </div>
                        <span className="text-neon-cyan font-bold">{dailyLeaderboard.find(e => e.user_id === primaryWallet?.address)?.score || 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No scores yet. Be the first!</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="alltime">
              {allTimeLeaderboard.length > 0 ? (
                <div className="space-y-2">
                  {allTimeLeaderboard.slice(0, 5).map((entry, idx) => (
                    <div key={entry.user_id || idx} className={`flex items-center justify-between p-2 rounded ${entry.user_id === primaryWallet?.address ? 'leaderboard-you' : 'bg-black/20'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-500'}`}>#{idx + 1}</span>
                        <span className="text-sm text-gray-300">{entry.user_id ? `${entry.user_id.slice(0, 6)}...${entry.user_id.slice(-4)}` : 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neon-cyan font-bold">{entry.score}</span>
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400">{entry.best_streak}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No scores yet. Be the first!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Lifelines Status */}
      {isWalletConnected && userStats && (
        <Card className="cyber-glass p-4 max-w-4xl mx-auto mt-6">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center text-lg">🎯</div>
              <div>
                <div className="text-sm font-bold text-white">50/50</div>
                <div className="text-xs text-gray-500">{userStats.lifeline_5050_charges} charges</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center text-lg">
                <Clock className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">+5 Sec</div>
                <div className="text-xs text-gray-500">{userStats.lifeline_time_charges} charges</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center text-lg">⏭️</div>
              <div>
                <div className="text-sm font-bold text-white">Skip</div>
                <div className="text-xs text-gray-500">{userStats.lifeline_skip_charges} charges</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
