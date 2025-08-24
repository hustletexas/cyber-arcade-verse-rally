
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { 
  Play, 
  Square, 
  Eye, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX,
  Maximize,
  Settings,
  Camera,
  Mic,
  MicOff
} from 'lucide-react';

interface Stream {
  id: string;
  title: string;
  streamerName: string;
  game: string;
  viewers: number;
  isLive: boolean;
  thumbnail: string;
  category: string;
  tags: string[];
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isStreamer: boolean;
}

export const LiveStreaming = () => {
  const { user } = useAuth();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const { toast } = useToast();
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamGame, setStreamGame] = useState('Cyber Arcade');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Mock live streams data
  const [liveStreams] = useState<Stream[]>([
    {
      id: '1',
      title: 'Epic Tetris Battle Tournament Finals!',
      streamerName: 'CyberGamer_Pro',
      game: 'Tetris',
      viewers: 1247,
      isLive: true,
      thumbnail: '/placeholder.svg',
      category: 'Tournament',
      tags: ['Competitive', 'Live Event', 'Prize Pool']
    },
    {
      id: '2',
      title: 'Pac-Man Speedrun World Record Attempt',
      streamerName: 'RetroKing88',
      game: 'Pac-Man',
      viewers: 892,
      isLive: true,
      thumbnail: '/placeholder.svg',
      category: 'Speedrun',
      tags: ['World Record', 'Retro', 'Skills']
    },
    {
      id: '3',
      title: 'Teaching Galaga Advanced Strategies',
      streamerName: 'ArcadeMaster',
      game: 'Galaga',
      viewers: 456,
      isLive: true,
      thumbnail: '/placeholder.svg',
      category: 'Educational',
      tags: ['Tutorial', 'Tips', 'Strategy']
    }
  ]);

  const [streamChat, setStreamChat] = useState<ChatMessage[]>([
    {
      id: '1',
      username: 'ViewerOne',
      message: 'Amazing gameplay! 🔥',
      timestamp: new Date(Date.now() - 30000),
      isStreamer: false
    },
    {
      id: '2',
      username: 'CyberGamer_Pro',
      message: 'Thanks for watching everyone! Going for the high score!',
      timestamp: new Date(Date.now() - 15000),
      isStreamer: true
    }
  ]);

  const [chatMessage, setChatMessage] = useState('');

  const startStream = async () => {
    if (!user && !isWalletConnected) {
      toast({
        title: "Authentication Required",
        description: "Please login or connect wallet to start streaming",
        variant: "destructive",
      });
      return;
    }

    if (!streamTitle.trim()) {
      toast({
        title: "Stream Title Required",
        description: "Please enter a title for your stream",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsStreaming(true);
      
      toast({
        title: "Stream Started! 🎮",
        description: `Now streaming: ${streamTitle}`,
      });

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopStream();
      };

    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Stream Error",
        description: "Failed to start stream. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    
    toast({
      title: "Stream Ended",
      description: "Your stream has been stopped",
    });
  };

  const joinStream = (stream: Stream) => {
    setSelectedStream(stream);
    toast({
      title: "Joined Stream! 📺",
      description: `Watching ${stream.streamerName}'s stream`,
    });
  };

  const leaveStream = () => {
    setSelectedStream(null);
  };

  const sendChatMessage = () => {
    if (chatMessage.trim() && selectedStream) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        username: user?.user_metadata?.username || primaryWallet?.address.slice(0, 8) || 'Anonymous',
        message: chatMessage.trim(),
        timestamp: new Date(),
        isStreamer: false
      };
      
      setStreamChat(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  const formatViewers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 
          className="text-2xl font-bold text-neon-pink mb-2"
          style={{
            fontFamily: 'Orbitron, monospace',
            textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
            filter: 'drop-shadow(0 0 8px #ff00ff)'
          }}
        >
          📺 CYBER CITY STREAMS
        </h2>
        <p className="text-neon-cyan">Watch live gameplay or stream your own!</p>
      </div>

      {/* Stream Controls */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-neon-purple flex items-center gap-2">
            <Camera size={20} />
            STREAM CONTROLS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Stream Setup */}
            <div className="space-y-4">
              <Input
                placeholder="Stream title (e.g., Epic Tetris Battle!)"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="bg-black/50 border-neon-cyan text-white"
                disabled={isStreaming}
              />
              
              <Input
                placeholder="Game/Category"
                value={streamGame}
                onChange={(e) => setStreamGame(e.target.value)}
                className="bg-black/50 border-neon-purple text-white"
                disabled={isStreaming}
              />

              <div className="flex gap-2">
                <Button
                  onClick={isStreaming ? stopStream : startStream}
                  className={`flex-1 ${
                    isStreaming 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'cyber-button'
                  }`}
                >
                  {isStreaming ? (
                    <>
                      <Square size={16} className="mr-2" />
                      STOP STREAM
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" />
                      START STREAM
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setIsMicOn(!isMicOn)}
                  size="sm"
                  variant="outline"
                  className={`${
                    isMicOn 
                      ? 'bg-neon-green/20 border-neon-green' 
                      : 'bg-red-600/20 border-red-600'
                  }`}
                  disabled={!isStreaming}
                >
                  {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                </Button>
              </div>

              {isStreaming && (
                <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green">
                  <div className="flex items-center gap-2 text-neon-green">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span className="font-bold">LIVE</span>
                    <span>•</span>
                    <span>{Math.floor(Math.random() * 50) + 10} viewers</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{streamTitle}</p>
                </div>
              )}
            </div>

            {/* Stream Preview */}
            <div className="space-y-2">
              <div 
                className="relative aspect-video bg-black rounded-lg border border-neon-purple overflow-hidden"
                style={{ minHeight: '200px' }}
              >
                {isStreaming ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-neon-purple">
                    <div className="text-center">
                      <Camera size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Stream Preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Streams Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stream List */}
        <div className="lg:col-span-2">
          <Card className="arcade-frame h-fit">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center gap-2">
                <Eye size={20} />
                LIVE STREAMS ({liveStreams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {liveStreams.map((stream) => (
                  <div
                    key={stream.id}
                    className="flex gap-4 p-4 rounded-lg border border-neon-purple/30 bg-black/30 hover:bg-black/50 transition-all cursor-pointer"
                    onClick={() => joinStream(stream)}
                  >
                    {/* Thumbnail */}
                    <div className="relative">
                      <div className="w-20 h-14 bg-neon-purple/20 rounded border border-neon-purple flex items-center justify-center">
                        <Play size={16} className="text-neon-purple" />
                      </div>
                      <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs">
                        LIVE
                      </Badge>
                    </div>

                    {/* Stream Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-neon-pink truncate">{stream.title}</h3>
                      <p className="text-neon-cyan text-sm">{stream.streamerName}</p>
                      <p className="text-neon-purple text-xs">{stream.game}</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-neon-green text-xs">
                          <Eye size={12} />
                          {formatViewers(stream.viewers)}
                        </div>
                        <Badge className="bg-neon-purple/20 text-neon-purple text-xs">
                          {stream.category}
                        </Badge>
                      </div>

                      <div className="flex gap-1 mt-1">
                        {stream.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs text-gray-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button size="sm" className="cyber-button">
                      WATCH
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stream Viewer / Chat */}
        <div className="space-y-4">
          {selectedStream ? (
            <>
              {/* Stream Player */}
              <Card className="arcade-frame">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-neon-pink text-lg truncate">
                      {selectedStream.title}
                    </CardTitle>
                    <Button
                      onClick={leaveStream}
                      size="sm"
                      variant="ghost"
                      className="text-neon-cyan hover:text-neon-pink"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-600 text-white">LIVE</Badge>
                    <span className="text-neon-cyan text-sm">{selectedStream.streamerName}</span>
                    <div className="flex items-center gap-1 text-neon-green text-sm">
                      <Users size={12} />
                      {formatViewers(selectedStream.viewers)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Mock Video Player */}
                  <div className="aspect-video bg-black rounded border border-neon-purple mb-3 flex items-center justify-center">
                    <div className="text-center text-neon-purple">
                      <Play size={48} className="mx-auto mb-2" />
                      <p>Live Stream Player</p>
                      <p className="text-xs">(Demo Mode)</p>
                    </div>
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-neon-pink">
                        <Heart size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-neon-cyan">
                        <Share2 size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-neon-purple">
                        <Maximize size={16} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setIsMuted(!isMuted)}
                        size="sm"
                        variant="ghost"
                        className="text-neon-cyan"
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </Button>
                      <span className="text-xs text-neon-purple">{volume}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stream Chat */}
              <Card className="arcade-frame">
                <CardHeader className="pb-2">
                  <CardTitle className="text-neon-cyan text-lg flex items-center gap-2">
                    <MessageCircle size={16} />
                    STREAM CHAT
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-80">
                  <ScrollArea className="flex-1 mb-3">
                    <div className="space-y-2">
                      {streamChat.map((msg) => (
                        <div key={msg.id} className="text-sm">
                          <span className={`font-bold ${
                            msg.isStreamer ? 'text-neon-pink' : 'text-neon-cyan'
                          }`}>
                            {msg.username}
                            {msg.isStreamer && <span className="ml-1">👑</span>}
                          </span>
                          <span className="text-gray-300 ml-2">{msg.message}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {(user || isWalletConnected) ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Say something..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        className="flex-1 bg-black/50 border-neon-purple text-white text-sm"
                      />
                      <Button
                        onClick={sendChatMessage}
                        size="sm"
                        className="cyber-button"
                        disabled={!chatMessage.trim()}
                      >
                        SEND
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-neon-purple text-sm">
                      Login to participate in chat
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="arcade-frame">
              <CardContent className="text-center py-8">
                <Eye size={48} className="mx-auto mb-4 text-neon-purple opacity-50" />
                <h3 className="text-neon-cyan font-bold mb-2">No Stream Selected</h3>
                <p className="text-gray-400 text-sm">
                  Click on a stream to start watching
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
