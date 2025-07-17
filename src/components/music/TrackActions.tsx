
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, MessageCircle, Share2, RotateCcw, ShoppingCart, Coins } from 'lucide-react';
import { Track } from '@/types/music';

interface TrackActionsProps {
  track: Track;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onReplay: () => void;
  onPurchaseNFT: () => void;
}

export const TrackActions: React.FC<TrackActionsProps> = ({
  track,
  onLike,
  onComment,
  onShare,
  onReplay,
  onPurchaseNFT
}) => {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {/* Like Button */}
      <Button
        onClick={onLike}
        size="sm"
        variant="ghost"
        className={`flex items-center gap-1 h-8 px-3 transition-all duration-300 ${
          track.isLiked 
            ? 'text-neon-pink bg-neon-pink/20 hover:bg-neon-pink/30' 
            : 'text-neon-cyan hover:text-neon-pink hover:bg-neon-pink/20'
        }`}
      >
        <Heart size={14} className={track.isLiked ? 'fill-current' : ''} />
        <span className="text-xs">{track.likes}</span>
      </Button>

      {/* Comment Button */}
      <Button
        onClick={onComment}
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 h-8 px-3 text-neon-cyan hover:text-neon-purple hover:bg-neon-purple/20 transition-all duration-300"
      >
        <MessageCircle size={14} />
        <span className="text-xs">{track.comments.length}</span>
      </Button>

      {/* Share Button */}
      <Button
        onClick={onShare}
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 h-8 px-3 text-neon-cyan hover:text-neon-green hover:bg-neon-green/20 transition-all duration-300"
      >
        <Share2 size={14} />
        <span className="text-xs">Share</span>
      </Button>

      {/* Replay Button */}
      <Button
        onClick={onReplay}
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 h-8 px-3 text-neon-cyan hover:text-neon-pink hover:bg-neon-pink/20 transition-all duration-300"
      >
        <RotateCcw size={14} />
        <span className="text-xs">Replay</span>
      </Button>

      {/* NFT Purchase Button */}
      {track.nft && track.nft.isForSale && (
        <Button
          onClick={onPurchaseNFT}
          size="sm"
          className="flex items-center gap-1 h-8 px-3 bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:from-neon-pink hover:to-neon-purple transition-all duration-300"
        >
          <ShoppingCart size={14} />
          <Coins size={12} />
          <span className="text-xs font-bold">{track.nft.price} SOL</span>
        </Button>
      )}

      {/* NFT Badge */}
      {track.nft && (
        <Badge className="bg-gradient-to-r from-neon-purple to-neon-pink text-white text-xs">
          NFT #{track.nft.tokenId}
        </Badge>
      )}
    </div>
  );
};
