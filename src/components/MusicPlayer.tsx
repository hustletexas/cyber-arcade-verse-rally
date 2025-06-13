import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Music, ExternalLink } from 'lucide-react';
import { WalletIntegration } from './music/WalletIntegration';
import { PlayerControls } from './music/PlayerControls';
import { TrackInfo } from './music/TrackInfo';
import { RewardsSystem } from './music/RewardsSystem';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  audiusUrl?: string;
  streamUrl?: string;
  audiusTrackId?: string;
  solanaAddress?: string;
}

const playlist: Track[] = [
  {
    id: '1',
    title: 'Digital Dreams',
    artist: 'CyberBeats',
    duration: '3:45',
    genre: 'Synthwave',
    audiusUrl: 'https://audius.co/cyberbeats/digital-dreams',
    audiusTrackId: 'x5pJ3Az',
    solanaAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
  },
  {
    id: '2',
    title: 'Neon Arcade',
    artist: 'RetroFuture',
    duration: '4:12',
    genre: 'Chiptune',
    audiusUrl: 'https://audius.co/retrofuture/neon-arcade',
    audiusTrackId: 'D7KyD',
    solanaAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'
  },
  {
    id: '3',
    title: 'Pixel Paradise',
    artist: 'GameBeats',
    duration: '3:28',
    genre: 'Electronic',
    audiusUrl: 'https://audius.co/gamebeats/pixel-paradise',
    audiusTrackId: 'eP64B',
    solanaAddress: '5TtLdRBVYETvRKZh6RGUddq3v6dpbfSjKg4P1X5XNPvs'
  },
  {
    id: '4',
    title: 'Cyber City Nights',
    artist: 'Synthwave Collective',
    duration: '5:03',
    genre: 'Synthwave',
    audiusUrl: 'https://audius.co/synthwave/cyber-city-nights',
    audiusTrackId: 'mlvKP',
    solanaAddress: '8FGH6ZAAb2EeCr1smsJaJQnEuNb3N2gkHgGN9aG5Pqr9'
  },
  {
    id: '5',
    title: 'Retro Runner',
    artist: 'Arcade Masters',
    duration: '3:55',
    genre: 'Chiptune',
    audiusUrl: 'https://audius.co/arcade-masters/retro-runner',
    audiusTrackId: 'DdcxZ',
    solanaAddress: '7uPNeFb9GVCk2N8aP1FhBXcGsYN7z8YxSMvQ2KwBvKf3'
  }
];

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [audioRewards, setAudioRewards] = useState(0);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Connect to Phantom Wallet for Solana integration
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setIsWalletConnected(true);
        setAudioRewards(Math.floor(Math.random() * 100) + 50);
        
        toast({
          title: "Wallet Connected!",
          description: `Connected to Audius via Solana. Earned ${audioRewards} $AUDIO tokens!`,
        });
      } else {
        window.open('https://phantom.app/', '_blank');
        toast({
          title: "Phantom Wallet Required",
          description: "Install Phantom to earn $AUDIO tokens while listening",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  // Simulate streaming rewards
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isWalletConnected) {
      interval = setInterval(() => {
        setAudioRewards(prev => prev + 0.1);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isWalletConnected]);

  // Simulate audio progress for demo purposes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            handleNext();
            return 0;
          }
          
          const totalSeconds = Math.floor((newProgress / 100) * 240);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          
          return newProgress;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = async () => {
    setIsPlaying(!isPlaying);
    const currentSong = playlist[currentTrack];
    
    if (!isPlaying) {
      console.log(`🎵 Streaming from Audius: ${currentSong.audiusUrl}`);
      console.log(`📡 Audius Track ID: ${currentSong.audiusTrackId}`);
      console.log(`🔗 Solana Address: ${currentSong.solanaAddress}`);
      
      if (isWalletConnected) {
        toast({
          title: "🎵 Now Playing",
          description: `Earning $AUDIO tokens while streaming "${currentSong.title}"`,
        });
      } else {
        toast({
          title: "🎵 Now Playing",
          description: "Connect wallet to earn $AUDIO tokens while listening!",
        });
      }
    }
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
    setProgress(0);
    setCurrentTime('0:00');
  };

  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
    setProgress(0);
    setCurrentTime('0:00');
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const openAudius = () => {
    const currentSong = playlist[currentTrack];
    if (currentSong.audiusUrl) {
      window.open(currentSong.audiusUrl, '_blank');
    } else {
      window.open('https://audius.co/', '_blank');
    }
  };

  const tipArtist = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Connect your wallet to tip artists",
        variant: "destructive",
      });
      return;
    }

    const tipAmount = 1;
    if (audioRewards >= tipAmount) {
      setAudioRewards(prev => prev - tipAmount);
      toast({
        title: "Artist Tipped! 🎤",
        description: `Sent ${tipAmount} $AUDIO to ${playlist[currentTrack].artist}`,
      });
    } else {
      toast({
        title: "Insufficient Balance",
        description: "Keep listening to earn more $AUDIO tokens",
        variant: "destructive",
      });
    }
  };

  const currentSong = playlist[currentTrack];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-black/90 border border-neon-cyan/50 p-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlay}
              size="sm"
              className="cyber-button p-2 h-8 w-8"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <div className="text-xs text-neon-cyan min-w-0">
              <p className="truncate max-w-32">{currentSong.title}</p>
            </div>
            {isWalletConnected && (
              <Badge className="bg-neon-green text-black text-xs">
                {audioRewards.toFixed(1)} $AUDIO
              </Badge>
            )}
            <Button
              onClick={openAudius}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-neon-purple hover:text-neon-pink"
              title="Open on Audius"
            >
              <ExternalLink size={12} />
            </Button>
            <Button
              onClick={() => setIsMinimized(false)}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-neon-cyan hover:text-neon-pink"
            >
              ⬆️
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="arcade-frame sticky bottom-0 z-40 bg-black/95">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Music className="text-neon-cyan" size={20} />
            <span className="font-display text-neon-green">🎵 AUDIUS PLAYER</span>
            <Badge className="bg-neon-purple text-white text-xs">SOLANA POWERED</Badge>
            {isPlaying && <Badge className="bg-neon-pink text-black text-xs animate-pulse">STREAMING</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <WalletIntegration
              isWalletConnected={isWalletConnected}
              walletAddress={walletAddress}
              audioRewards={audioRewards}
              onWalletConnect={connectWallet}
              onTipArtist={tipArtist}
              currentArtist={currentSong.artist}
            />
            <Button
              onClick={openAudius}
              size="sm"
              variant="ghost"
              className="text-neon-purple hover:text-neon-pink"
              title="Open on Audius"
            >
              <ExternalLink size={16} />
            </Button>
            <Button
              onClick={() => setIsMinimized(true)}
              size="sm"
              variant="ghost"
              className="text-neon-cyan hover:text-neon-pink"
            >
              ⬇️
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <TrackInfo track={currentSong} onOpenAudius={openAudius} />
          
          <PlayerControls
            isPlaying={isPlaying}
            volume={volume}
            isMuted={isMuted}
            progress={progress}
            currentTime={currentTime}
            duration={currentSong.duration}
            onPlay={handlePlay}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onVolumeToggle={handleVolumeToggle}
          />
        </div>

        <RewardsSystem
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          currentTrack={currentSong}
          isPlaying={isPlaying}
          currentTrackIndex={currentTrack}
          totalTracks={playlist.length}
          nextTrackTitle={playlist[(currentTrack + 1) % playlist.length].title}
        />
      </CardContent>
    </Card>
  );
};
