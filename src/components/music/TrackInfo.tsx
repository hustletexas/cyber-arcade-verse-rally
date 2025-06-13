
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  audiusUrl?: string;
  audiusTrackId?: string;
  solanaAddress?: string;
}

interface TrackInfoProps {
  track: Track;
  onOpenAudius: () => void;
}

export const TrackInfo: React.FC<TrackInfoProps> = ({ track, onOpenAudius }) => {
  return (
    <div className="text-center md:text-left">
      <h4 className="font-bold text-neon-cyan text-sm md:text-base">{track.title}</h4>
      <p className="text-xs text-muted-foreground">{track.artist}</p>
      <div className="flex flex-wrap gap-1 mt-1 justify-center md:justify-start">
        <Badge className="bg-neon-pink text-black text-xs">
          {track.genre}
        </Badge>
        <Badge className="bg-neon-purple text-white text-xs">
          ID: {track.audiusTrackId}
        </Badge>
        <Button
          onClick={onOpenAudius}
          size="sm"
          variant="ghost"
          className="text-xs text-neon-purple hover:text-neon-pink h-5 px-1"
        >
          View on Audius
        </Button>
      </div>
    </div>
  );
};
