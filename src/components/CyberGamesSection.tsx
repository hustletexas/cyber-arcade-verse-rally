import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Brain, Zap, Trophy, ArrowRight } from 'lucide-react';
interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  route: string;
  badge?: string;
  badgeColor?: string;
}
const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  icon,
  gradient,
  route,
  badge,
  badgeColor = 'bg-neon-cyan'
}) => {
  const navigate = useNavigate();
  return <Card className={`relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 ${gradient}`} onClick={() => navigate(route)}>
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-neon-cyan/20 via-transparent to-neon-purple/20" />
      
      {badge && <Badge className={`absolute top-3 right-3 ${badgeColor} text-black font-bold text-xs`}>
          {badge}
        </Badge>}
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-black/30 border border-white/10 group-hover:border-neon-cyan/50 transition-colors">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-neon-cyan transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {description}
            </p>
            <div className="flex items-center text-neon-cyan text-sm font-medium">
              Play Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export const CyberGamesSection: React.FC = () => {
  return <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
            CYBER CITY ARCADE GAMES
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Play to earn CCC tokens and compete on the leaderboards
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        <GameCard title="Cyber Match" description="Memory card matching game. Find pairs, build combos, earn rewards!" icon={<Gamepad2 className="w-8 h-8 text-neon-cyan" />} gradient="bg-gradient-to-br from-cyan-900/40 via-gray-900/60 to-gray-900/40 border border-neon-cyan/20" route="/games/cyber-match" badge="POPULAR" badgeColor="bg-neon-cyan" />
        
        <GameCard title="Cyber Sequence" description="Simon-style memory game. Watch, remember, repeat the sequence!" icon={<Brain className="w-8 h-8 text-neon-purple" />} gradient="bg-gradient-to-br from-purple-900/40 via-gray-900/60 to-gray-900/40 border border-neon-purple/20" route="/games/cyber-sequence" badge="NEW" badgeColor="bg-neon-purple" />
        
        <GameCard title="Cyber Trivia" description="Test your gaming knowledge! Answer questions, build streaks, win prizes!" icon={<Zap className="w-8 h-8 text-neon-pink" />} gradient="bg-gradient-to-br from-pink-900/40 via-gray-900/60 to-gray-900/40 border border-neon-pink/20" route="/games/cyber-trivia" badge="HOT" badgeColor="bg-neon-pink" />
      </div>

      {/* Features */}
      <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Free & Ranked Modes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-neon-cyan" />
          <span>Daily Leaderboards</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🎫</span>
          <span>Earn Tickets & Rewards</span>
        </div>
      </div>
    </div>;
};
export default CyberGamesSection;