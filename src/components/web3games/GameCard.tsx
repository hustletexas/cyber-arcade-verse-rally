
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';

interface GameCardProps {
  game: {
    id: string;
    name: string;
    category: string;
    blockchain: string;
    image: string;
    description: string;
    playUrl: string | null;
    downloadUrl?: string | null;
    isWebBased: boolean;
    rewards: string[];
    players: string;
    rating: number;
  };
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const handlePrimary = () => {
    if (game.isWebBased && game.playUrl) {
      window.open(game.playUrl, '_blank');
      toast.success(`Launching ${game.name}...`);
    } else if (game.playUrl) {
      window.open(game.playUrl, '_blank');
    } else if (game.downloadUrl) {
      window.open(game.downloadUrl, '_blank');
      toast.success(`Opening ${game.name} download page...`);
    } else {
      toast.info(`${game.name} — coming soon!`);
    }
  };

  const handleDownload = () => {
    if (game.downloadUrl) {
      window.open(game.downloadUrl, '_blank');
      toast.success(`Opening ${game.name} download page...`);
    }
  };

  const getPrimaryLabel = () => {
    if (game.isWebBased && game.playUrl) return '🚀 PLAY NOW';
    if (game.playUrl) return '🌐 WEBSITE';
    if (game.downloadUrl) return '📥 GET GAME';
    return '🔜 COMING SOON';
  };

  const showDownloadButton = !game.isWebBased && game.downloadUrl && game.playUrl;

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
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handlePrimary}
            className="w-full cyber-button text-sm"
            size="sm"
          >
            {getPrimaryLabel()}
          </Button>
          {showDownloadButton && (
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="w-full border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black text-sm"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              DOWNLOAD
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
