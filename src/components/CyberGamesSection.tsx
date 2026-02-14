import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Brain, Zap, Trophy, ArrowRight, Gift } from 'lucide-react';
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
  const navigate = useNavigate();
  return <Card className="arcade-frame">
      <CardContent className="p-6 space-y-6">
      {/* Section Banner */}
      <div className="w-full relative">
        <img alt="Cyber City Arcade Games" className="w-full h-auto rounded-lg" src="/lovable-uploads/b8a7ac8d-1113-4d55-ab57-c5cbf1182247.png" />
        <div className="flex justify-center mt-3">
          <Button
            onClick={() => navigate('/esports')}
            className="bg-transparent border border-neon-cyan/50 hover:border-neon-cyan hover:bg-neon-cyan/10 backdrop-blur-sm text-neon-cyan hover:text-white px-8 py-3 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Cyber City Esports
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cyber Match - Image Card */}
        <Card className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 border border-neon-cyan/30" onClick={() => navigate('/games/cyber-match')}>
          <img src="/images/games/cyber-match-card.png" alt="Cyber Match" className="w-full h-full object-cover" />
          <Badge className="absolute top-3 right-3 bg-neon-cyan text-black font-bold text-xs">
            POPULAR
          </Badge>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="flex items-center text-neon-cyan text-sm font-medium">
              Play Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
        
        {/* Cyber Sequence - Image Card */}
        <Card className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 border border-neon-purple/30" onClick={() => navigate('/games/cyber-sequence')}>
          <img src="/images/games/cyber-sequence-card.png" alt="Cyber Sequence" className="w-full h-full object-cover" />
          <Badge className="absolute top-3 right-3 bg-neon-purple text-black font-bold text-xs">
            NEW
          </Badge>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="flex items-center text-neon-purple text-sm font-medium">
              Play Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
        
        {/* Cyber Trivia - Image Card */}
        <Card className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 border border-neon-pink/30" onClick={() => navigate('/games/cyber-trivia')}>
          <img src="/images/games/cyber-trivia-card.png" alt="Cyber Trivia" className="w-full h-full object-cover" />
          <Badge className="absolute top-3 right-3 bg-neon-pink text-black font-bold text-xs">
            HOT
          </Badge>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="flex items-center text-neon-pink text-sm font-medium">
              Play Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cyber Breaker, Claim Chest & Cyber Galaxy Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Cyber Breaker - Left */}
        <Card className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 border border-pink-500/30" onClick={() => navigate('/cyber-drop')}>
          <img src="/images/games/cyber-breaker-card.png" alt="Cyber Breaker" className="w-full h-auto object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="flex items-center text-pink-400 text-sm font-medium">
              Play Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>

        {/* Claim Chest - Center */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/cyber-chest')}
            className="bg-transparent border border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-500/10 backdrop-blur-sm text-yellow-400 hover:text-yellow-300 px-8 py-3 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]">

            <Gift className="w-5 h-5 mr-2" />
            Unlock Chest
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Cyber Galaxy - Right */}
        <Card className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 border border-purple-500/30" onClick={() => navigate('/cyber-galaxy')}>
          <img src="/images/games/cyber-galaxy-card.png?v=2" alt="Cyber Galaxy" className="w-full h-auto object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="flex items-center text-purple-400 text-sm font-medium">
              Play Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
      </div>

      {/* Features */}
      <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🎮</span>
          <span>More Games Coming Soon</span>
        </div>
      </div>
      </CardContent>
    </Card>;
};
export default CyberGamesSection;