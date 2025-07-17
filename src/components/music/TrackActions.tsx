
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Heart, MessageCircle, Share2, RotateCcw } from 'lucide-react';
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
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      // Add comment to track (this would normally save to backend)
      const newComment = {
        id: Date.now().toString(),
        userId: 'current-user-id',
        username: 'Current User',
        content: commentText.trim(),
        timestamp: new Date(),
        likes: 0
      };
      
      toast({
        title: "Comment Added!",
        description: `Your comment on "${track.title}" has been posted`,
      });
      
      setCommentText('');
      setShowCommentInput(false);
      onComment();
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${track.title} by ${track.artist}`,
          text: `Check out this track: ${track.title} by ${track.artist}`,
          url: window.location.href,
        });
        
        toast({
          title: "Shared Successfully!",
          description: `"${track.title}" has been shared`,
        });
      } else {
        // Fallback to clipboard
        const shareText = `🎵 Check out "${track.title}" by ${track.artist} on Cyber City Radio! ${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        
        toast({
          title: "Link Copied!",
          description: `Share link for "${track.title}" copied to clipboard`,
        });
      }
    } catch (error) {
      // Fallback to clipboard if share fails
      try {
        const shareText = `🎵 Check out "${track.title}" by ${track.artist} on Cyber City Radio! ${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        
        toast({
          title: "Link Copied!",
          description: `Share link for "${track.title}" copied to clipboard`,
        });
      } catch (clipboardError) {
        toast({
          title: "Share Failed",
          description: "Unable to share or copy link",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div className="flex flex-wrap items-center gap-2">
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
          onClick={() => setShowCommentInput(!showCommentInput)}
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 h-8 px-3 text-neon-cyan hover:text-neon-purple hover:bg-neon-purple/20 transition-all duration-300"
        >
          <MessageCircle size={14} />
          <span className="text-xs">{track.comments.length}</span>
        </Button>

        {/* Share Button */}
        <Button
          onClick={handleShare}
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
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 text-sm bg-black/30 border border-neon-cyan/30 rounded-lg text-neon-cyan placeholder-neon-cyan/50 focus:outline-none focus:border-neon-pink/50"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCommentSubmit();
              }
            }}
          />
          <Button
            onClick={handleCommentSubmit}
            size="sm"
            className="px-3 bg-neon-cyan text-black hover:bg-neon-pink hover:text-white transition-all duration-300"
          >
            Post
          </Button>
        </div>
      )}
    </div>
  );
};
