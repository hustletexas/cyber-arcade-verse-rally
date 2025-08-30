
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface GameCardProps {
  game: {
    id: string;
    name: string;
    category: string;
    blockchain: string;
    image: string;
    description: string;
    playUrl: string;
    downloadUrl?: string | null;
    isWebBased: boolean;
    rewards: string[];
    players: string;
    rating: number;
  };
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const handlePlay = () => {
    if (game.isWebBased) {
      window.open(game.playUrl, '_blank');
      toast.success(`Launching ${game.name}...`);
    } else {
      toast.info(`${game.name} requires download to play`);
    }
  };

  const handleDownload = () => {
    if (game.downloadUrl) {
      window.open(game.downloadUrl, '_blank');
      toast.success(`Downloading ${game.name}...`);
    } else {
      toast.error('Download not available for this game');
    }
  };

  return (
    <Card className="holographic hover:scale-105 transition-all duration-300">
      <CardHeader className="p-0">
        <div className="relative">
          <img 
            src={game.image} 
            alt={game.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-black/70 text-white">
              {game.blockchain}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-neon-green/80 text-black">
              ⭐ {game.rating}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg text-neon-cyan mb-2">{game.name}</CardTitle>
        <Badge className="mb-3 bg-neon-purple/20 text-neon-purple text-xs">
          {game.category}
        </Badge>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {game.description}
        </p>
        
        {/* Rewards */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-neon-pink mb-2">💰 Earn:</p>
          <div className="flex flex-wrap gap-1">
            {game.rewards.slice(0, 2).map((reward, index) => (
              <Badge key={index} className="text-xs bg-neon-pink/20 text-neon-pink">
                {reward}
              </Badge>
            ))}
            {game.rewards.length > 2 && (
              <Badge className="text-xs bg-gray-500/20 text-gray-400">
                +{game.rewards.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">👥 {game.players}</span>
          <Badge className={`text-xs ${game.isWebBased ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
            {game.isWebBased ? '🌐 Web' : '💾 Download'}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handlePlay}
            className="flex-1 cyber-button text-sm"
            size="sm"
          >
            {game.isWebBased ? '🚀 PLAY' : '👀 VIEW'}
          </Button>
          {!game.isWebBased && game.downloadUrl && (
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
              size="sm"
            >
              📥
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
