import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TriviaUserStats, TriviaDailyLeaderboardEntry } from '@/types/cyber-trivia';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Flame, Zap, Trophy, Target, Ticket, Clock, Gamepad2, Film, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TriviaCategory = 'Gaming' | 'Entertainment';
type PlayMode = 'free' | 'prize';

interface CyberTriviaHomeProps {
  onStartFreePlay: (category: TriviaCategory, playMode: PlayMode) => void;
  onStartDailyRun: () => void;
  userStats: TriviaUserStats | null;
  dailyLeaderboard: TriviaDailyLeaderboardEntry[];
  loading: boolean;
}

export const CyberTriviaHome: React.FC<CyberTriviaHomeProps> = ({
  onStartFreePlay,
  onStartDailyRun,
  userStats,
  dailyLeaderboard,
  loading,
}) => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  const userRank = dailyLeaderboard.findIndex(e => e.user_id === primaryWallet?.address) + 1;

  const handleFreePlayClick = () => {
    setShowCategorySelect(true);
  };

  const handleCategorySelect = (category: TriviaCategory, playMode: PlayMode) => {
    onStartFreePlay(category, playMode);
    setShowCategorySelect(false);
  };

  const handleBackToMenu = () => {
    setShowCategorySelect(false);
  };

  return (
    <div className="relative z-10 space-y-6">
      <AnimatePresence mode="wait">
        {showCategorySelect ? (
          <motion.div
            key="category-select"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            {/* Category Selection */}
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                onClick={handleBackToMenu}
                className="text-neon-cyan hover:text-neon-cyan/80 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h2 className="cyber-title text-3xl md:text-4xl text-neon-cyan" data-text="CHOOSE YOUR CATEGORY">
                CHOOSE YOUR CATEGORY
              </h2>
              <p className="text-gray-400 mt-2">Select a trivia category to start Free Play</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Gaming Category */}
              <Card className="cyber-glass p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-neon-cyan/10 flex items-center justify-center">
                    <Gamepad2 className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">GAMING</h3>
                  <p className="text-gray-400 text-sm">
                    Video games, esports, retro classics & gaming culture
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-2">
                    <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan text-xs">
                      Retro
                    </Badge>
                    <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan text-xs">
                      Esports
                    </Badge>
                    <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan text-xs">
                      Console
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      onClick={() => handleCategorySelect('Gaming', 'free')}
                      disabled={loading}
                      variant="outline"
                      className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 py-5"
                    >
                      <span className="font-bold">FREE</span>
                    </Button>
                    <Button 
                      onClick={() => handleCategorySelect('Gaming', 'prize')}
                      disabled={loading}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-5"
                    >
                      🏆 WIN CCTR
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Entertainment Category */}
              <Card className="cyber-glass-purple p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Film className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">ENTERTAINMENT</h3>
                  <p className="text-gray-400 text-sm">
                    Movies, TV shows, music, sports & pop culture
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-2">
                    <Badge variant="outline" className="border-purple-400/50 text-purple-400 text-xs">
                      Movies
                    </Badge>
                    <Badge variant="outline" className="border-purple-400/50 text-purple-400 text-xs">
                      Music
                    </Badge>
                    <Badge variant="outline" className="border-purple-400/50 text-purple-400 text-xs">
                      Sports
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      onClick={() => handleCategorySelect('Entertainment', 'free')}
                      disabled={loading}
                      variant="outline"
                      className="border-purple-400/50 text-purple-400 hover:bg-purple-500/10 py-5"
                    >
                      <span className="font-bold">FREE</span>
                    </Button>
                    <Button 
                      onClick={() => handleCategorySelect('Entertainment', 'prize')}
                      disabled={loading}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-5"
                    >
                      🏆 WIN CCTR
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section */}
            <div className="text-center py-8">
              <h1 
                className="cyber-title font-display text-4xl md:text-5xl lg:text-6xl text-neon-cyan mb-4"
                data-text="CYBER TRIVIA CHALLENGE"
              >
                CYBER TRIVIA CHALLENGE
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

            {/* Mode Selection CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Play Card */}
              <Card className="cyber-glass p-6 hover:border-neon-cyan/50 transition-all duration-300">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-neon-cyan/10 flex items-center justify-center">
                    <Flame className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">FREE PLAY</h2>
                  <p className="text-gray-400 text-sm">
                    Endless questions • Build your streak • Practice mode
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
                      🔥 Streak Meter
                    </Badge>
                    <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
                      ⚡ Combo Multiplier
                    </Badge>
                    <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
                      🎫 Earn Tickets
                    </Badge>
                  </div>
                  <Button 
                    onClick={handleFreePlayClick}
                    disabled={loading}
                    className="cyber-cta-primary w-full py-6 text-lg font-bold text-neon-cyan"
                  >
                    {loading ? 'Loading...' : '🎮 START FREE PLAY'}
                  </Button>
                </div>
              </Card>

              {/* Daily Run Card */}
              <Card className="cyber-glass-purple p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">DAILY RUN</h2>
                  <p className="text-gray-400 text-sm">
                    10 questions • 2 lives • Ranked leaderboard
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="border-purple-400/50 text-purple-400">
                      🏆 Compete Daily
                    </Badge>
                    <Badge variant="outline" className="border-purple-400/50 text-purple-400">
                      ❤️ 2 Lives
                    </Badge>
                    <Badge variant="outline" className="border-purple-400/50 text-purple-400">
                      📊 Top 100
                    </Badge>
                  </div>
                  <Button 
                    onClick={onStartDailyRun}
                    disabled={loading}
                    className="cyber-cta-secondary w-full py-6 text-lg font-bold text-purple-400"
                  >
                    {loading ? 'Loading...' : '🎯 START DAILY RUN'}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Stats & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
              {/* User Stats */}
              <Card className="cyber-glass p-5">
                <h3 className="text-lg font-bold text-neon-cyan mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" /> Your Stats
                </h3>
                {isWalletConnected && userStats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-black/30">
                      <div className="text-2xl font-bold text-white">{userStats.best_streak}</div>
                      <div className="text-xs text-gray-500">Best Streak</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-black/30">
                      <div className="text-2xl font-bold text-neon-green">{userStats.accuracy.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-black/30">
                      <div className="text-2xl font-bold text-purple-400">{userStats.total_runs}</div>
                      <div className="text-xs text-gray-500">Total Runs</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-black/30">
                      <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                        <Ticket className="w-4 h-4" /> {userStats.tickets_balance}
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

              {/* Daily Leaderboard Preview */}
              <Card className="cyber-glass-purple p-5">
                <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> Today's Top 5
                </h3>
                {dailyLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {dailyLeaderboard.slice(0, 5).map((entry, idx) => (
                      <div 
                        key={entry.user_id}
                        className={`flex items-center justify-between p-2 rounded ${
                          entry.user_id === primaryWallet?.address ? 'leaderboard-you' : 'bg-black/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${
                            idx === 0 ? 'text-yellow-400' : 
                            idx === 1 ? 'text-gray-300' : 
                            idx === 2 ? 'text-orange-400' : 'text-gray-500'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="text-sm text-gray-300">
                            {entry.user_id.slice(0, 6)}...{entry.user_id.slice(-4)}
                          </span>
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
                          <span className="text-neon-cyan font-bold">
                            {dailyLeaderboard.find(e => e.user_id === primaryWallet?.address)?.score || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No scores yet today</p>
                    <p className="text-xs mt-1">Be the first!</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Lifelines Status */}
            {isWalletConnected && userStats && (
              <Card className="cyber-glass p-4 max-w-4xl mx-auto mt-6">
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center text-lg">
                      🎯
                    </div>
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
                    <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center text-lg">
                      ⏭️
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Skip</div>
                      <div className="text-xs text-gray-500">{userStats.lifeline_skip_charges} charges</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
