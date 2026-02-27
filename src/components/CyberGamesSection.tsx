import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Brain, Zap, ArrowRight } from 'lucide-react';
import cyberColumnsBanner from '@/assets/cyber-columns-banner.png';
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Cyber Breaker */}
        <Card className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 border border-yellow-500/30" onClick={() => navigate('/games/cyber-breaker')}>
          <img src="/images/games/cyber-breaker-card.png" alt="Cyber Breaker" className="w-full h-auto object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="flex items-center text-yellow-400 text-sm font-medium">
              Play Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>

        {/* Cyber Galaxy */}
        <Card className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 border border-purple-500/30" onClick={() => navigate('/cyber-galaxy')}>
          <img src="/images/games/cyber-galaxy-card.png?v=2" alt="Cyber Galaxy" className="w-full h-auto object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="flex items-center text-purple-400 text-sm font-medium">
              Play Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>

        {/* Cyber Columns — NEW */}
        <Card className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 border border-neon-cyan/30" onClick={() => navigate('/games/cyber-columns')}>
          <div className="w-full h-48 relative">
            <img src={cyberColumnsBanner} alt="Cyber Columns - Falling gem puzzle" className="w-full h-full object-cover" />
          </div>
          <Badge className="absolute top-3 right-3 bg-neon-cyan text-black font-bold text-xs">
            NEW
          </Badge>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="flex items-center text-neon-cyan text-sm font-medium">
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