import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TriviaUserStats, TriviaDailyLeaderboardEntry } from '@/types/cyber-trivia';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Flame, Zap, Trophy, Target, Ticket, Clock, Gamepad2, Film, ArrowLeft, Calendar, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type TriviaCategory = 'Gaming' | 'Entertainment';
type PlayMode = 'free' | 'prize';
interface CyberTriviaHomeProps {
  onStartFreePlay: (category: TriviaCategory, playMode: PlayMode) => void;
  onStartDailyRun: () => void;
  userStats: TriviaUserStats | null;
  dailyLeaderboard: TriviaDailyLeaderboardEntry[];
  allTimeLeaderboard: TriviaDailyLeaderboardEntry[];
  loading: boolean;
}
export const CyberTriviaHome: React.FC<CyberTriviaHomeProps> = ({
  onStartFreePlay,
  onStartDailyRun,
  userStats,
  dailyLeaderboard,
  allTimeLeaderboard,
  loading
}) => {
  const {
    primaryWallet,
    isWalletConnected
  } = useMultiWallet();
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
  return <div className="relative z-10 space-y-6">
      <AnimatePresence mode="wait">
        {showCategorySelect ? <motion.div key="category-select" initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} transition={{
        duration: 0.3
      }} className="py-8">
            {/* Category Selection */}
            <div className="text-center mb-8">
              <Button variant="ghost" onClick={handleBackToMenu} className="text-neon-cyan hover:text-neon-cyan/80 mb-4">
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
                    <Button onClick={() => handleCategorySelect('Gaming', 'free')} disabled={loading} variant="outline" className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 py-5">
                      <span className="font-bold">FREE</span>
                    </Button>
                    <Button onClick={() => handleCategorySelect('Gaming', 'prize')} disabled={loading} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-5">
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
                    <Button onClick={() => handleCategorySelect('Entertainment', 'free')} disabled={loading} variant="outline" className="border-purple-400/50 text-purple-400 hover:bg-purple-500/10 py-5">
                      <span className="font-bold">FREE</span>
                    </Button>
                    <Button onClick={() => handleCategorySelect('Entertainment', 'prize')} disabled={loading} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-5">
                      🏆 WIN CCTR
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div> : <motion.div key="main-menu" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} transition={{
        duration: 0.3
      }}>
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

            {/* Mode Selection CTAs */}
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              <Button 
                variant="outline" 
                onClick={handleFreePlayClick} 
                disabled={loading} 
                className="px-8 py-6 text-lg font-bold text-neon-cyan border-neon-cyan/50 bg-transparent hover:bg-neon-cyan/10"
              >
                <Flame className="w-5 h-5 mr-2" />
                {loading ? 'Loading...' : 'FREE PLAY'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onStartDailyRun} 
                disabled={loading} 
                className="px-8 py-6 text-lg font-bold text-purple-400 border-purple-400/50 bg-transparent hover:bg-purple-400/10"
              >
                <Trophy className="w-5 h-5 mr-2" />
                {loading ? 'Loading...' : 'DAILY RUN'}
              </Button>
            </div>


            {/* Lifelines Status */}
            {isWalletConnected && userStats && <Card className="cyber-glass p-4 max-w-4xl mx-auto mt-6">
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
              </Card>}
          </motion.div>}
      </AnimatePresence>
    </div>;
};