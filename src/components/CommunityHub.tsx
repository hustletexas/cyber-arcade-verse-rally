
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VoiceChat } from '@/components/VoiceChat';
import { VoiceMessagePlayer } from '@/components/VoiceMessagePlayer';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Trophy, 
  Star,
  Bot,
  Music,
  Palette,
  Sparkles,
  Gamepad2,
  Brain,
  Headphones,
  Brush
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  username: string;
  walletAddress?: string;
  isGuest: boolean;
}

interface Message {
  id: string;
  username: string;
  message?: string;
  audioBlob?: Blob;
  audioDuration?: number;
  timestamp: Date;
  isGuest: boolean;
  walletAddress?: string;
  type: 'text' | 'voice';
}

interface ArtRequest {
  id: string;
  username: string;
  prompt: string;
  style: string;
  timestamp: Date;
  status: 'pending' | 'generating' | 'completed';
  imageUrl?: string;
}

interface MusicRequest {
  id: string;
  username: string;
  prompt: string;
  genre: string;
  timestamp: Date;
  status: 'pending' | 'generating' | 'completed';
  audioUrl?: string;
}

export const CommunityHub = () => {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [artRequests, setArtRequests] = useState<ArtRequest[]>([]);
  const [musicRequests, setMusicRequests] = useState<MusicRequest[]>([]);
  const [artPrompt, setArtPrompt] = useState('');
  const [artStyle, setArtStyle] = useState('cyberpunk');
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicGenre, setMusicGenre] = useState('electronic');
  const [coachQuery, setCoachQuery] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectToChat = () => {
    if (!user && !loading) {
      // Guest user
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        username: `Guest${Math.floor(Math.random() * 1000)}`,
        isGuest: true
      };
      setCurrentUser(guestUser);
    } else if (user) {
      // Authenticated user
      const authenticatedUser: User = {
        id: user.id,
        username: user.email?.split('@')[0] || 'Player',
        walletAddress: user.user_metadata?.wallet_address,
        isGuest: false
      };
      setCurrentUser(authenticatedUser);
    }
    
    setIsConnected(true);
    toast({
      title: "Connected to Community Hub! 🌟",
      description: "Welcome to the cyber city community",
    });

    // Add welcome message
    const welcomeMessage: Message = {
      id: `welcome_${Date.now()}`,
      username: 'System',
      message: `Welcome ${currentUser?.username || 'Player'}! 🎮 Share your gaming experiences!`,
      timestamp: new Date(),
      isGuest: false,
      walletAddress: '',
      type: 'text'
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      username: currentUser.username,
      message: newMessage,
      timestamp: new Date(),
      isGuest: currentUser.isGuest,
      walletAddress: currentUser.walletAddress || '',
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    toast({
      title: "Message Sent! 📤",
      description: "Your message has been shared with the community",
    });
  };

  const handleVoiceMessage = (audioBlob: Blob, duration: number) => {
    if (!currentUser) return;

    const voiceMessage: Message = {
      id: `voice_${Date.now()}`,
      username: currentUser.username,
      audioBlob,
      audioDuration: duration,
      timestamp: new Date(),
      isGuest: currentUser.isGuest,
      walletAddress: currentUser.walletAddress || '',
      type: 'voice'
    };

    setMessages(prev => [...prev, voiceMessage]);
  };

  const requestAIArt = () => {
    if (!artPrompt.trim() || !currentUser) return;

    const request: ArtRequest = {
      id: `art_${Date.now()}`,
      username: currentUser.username,
      prompt: artPrompt,
      style: artStyle,
      timestamp: new Date(),
      status: 'generating'
    };

    setArtRequests(prev => [...prev, request]);
    setArtPrompt('');

    // Simulate AI art generation
    setTimeout(() => {
      setArtRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'completed', imageUrl: '/placeholder.svg' }
            : req
        )
      );
    }, 3000);

    toast({
      title: "AI Art Request Submitted! 🎨",
      description: "Your NFT artwork is being generated...",
    });
  };

  const requestAIMusic = () => {
    if (!musicPrompt.trim() || !currentUser) return;

    const request: MusicRequest = {
      id: `music_${Date.now()}`,
      username: currentUser.username,
      prompt: musicPrompt,
      genre: musicGenre,
      timestamp: new Date(),
      status: 'generating'
    };

    setMusicRequests(prev => [...prev, request]);
    setMusicPrompt('');

    // Simulate AI music generation
    setTimeout(() => {
      setMusicRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'completed', audioUrl: '#' }
            : req
        )
      );
    }, 5000);

    toast({
      title: "AI Music Request Submitted! 🎵",
      description: "Your NFT music is being generated...",
    });
  };

  const askGamingCoach = () => {
    if (!coachQuery.trim()) return;

    // Simulate AI coach response
    const responses = [
      "Focus on your positioning and map awareness. Always check your minimap!",
      "Practice your aim daily with aim trainers. Consistency is key!",
      "Learn from your mistakes by reviewing replays of your games.",
      "Master one character/weapon at a time before moving to others.",
      "Communication is crucial in team games - use your mic effectively!",
      "Take breaks to avoid fatigue. Fresh mind = better performance!",
      "Study pro players and learn their strategies and techniques.",
      "Stay positive and maintain good mental health for peak performance."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setCoachResponse(`🎮 Gaming Coach: ${randomResponse}`);
    setCoachQuery('');

    toast({
      title: "Coach Response Ready! 🏆",
      description: "Your AI gaming coach has provided feedback",
    });
  };

  return (
    <Card className="border-neon-purple/30 bg-black/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-neon-cyan flex items-center justify-center gap-2">
          <Users className="w-6 h-6" />
          Community Hub
          <Sparkles className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/50">
            <TabsTrigger value="chat" className="text-neon-cyan">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="coach" className="text-neon-purple">
              <Brain className="w-4 h-4 mr-2" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger value="music" className="text-neon-green">
              <Headphones className="w-4 h-4 mr-2" />
              NFT Music
            </TabsTrigger>
            <TabsTrigger value="art" className="text-neon-pink">
              <Brush className="w-4 h-4 mr-2" />
              NFT Art
            </TabsTrigger>
          </TabsList>

          {/* Live Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            {!isConnected ? (
              <div className="text-center space-y-4">
                <div className="p-6 border border-neon-cyan/30 rounded-lg bg-neon-cyan/5">
                  <Users className="w-12 h-12 mx-auto text-neon-cyan mb-4" />
                  <h3 className="text-xl font-bold text-neon-cyan mb-2">Join the Community</h3>
                  <p className="text-gray-400 mb-4">
                    Connect with gamers worldwide • Share strategies • Voice chat available
                  </p>
                  <Button 
                    onClick={connectToChat}
                    className="cyber-button"
                  >
                    🚀 CONNECT TO CHAT
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Chat Messages */}
                <ScrollArea className="h-96 p-4 border border-neon-purple/30 rounded-lg bg-black/40">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.username === currentUser?.username ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            msg.username === currentUser?.username
                              ? 'bg-neon-pink/20 border border-neon-pink/30'
                              : 'bg-neon-cyan/20 border border-neon-cyan/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold ${
                              msg.isGuest ? 'text-yellow-400' : 'text-neon-green'
                            }`}>
                              {msg.username}
                            </span>
                            {!msg.isGuest && (
                              <Badge className="bg-neon-green/20 text-neon-green text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          {msg.type === 'voice' && msg.audioBlob ? (
                            <VoiceMessagePlayer
                              audioBlob={msg.audioBlob}
                              duration={msg.audioDuration || 0}
                              username={msg.username}
                              isOwnMessage={msg.username === currentUser?.username}
                            />
                          ) : (
                            <p className="text-white text-sm">{msg.message}</p>
                          )}
                          
                          <span className="text-xs text-gray-500">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-black/50 border-neon-purple/30"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} className="cyber-button px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Voice Chat */}
                <VoiceChat 
                  onVoiceMessage={handleVoiceMessage}
                  isConnected={isConnected}
                />
              </div>
            )}
          </TabsContent>

          {/* AI Gaming Coach Tab */}
          <TabsContent value="coach" className="space-y-4">
            <Card className="border-neon-purple/30 bg-black/50">
              <CardHeader>
                <CardTitle className="text-neon-purple flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Gaming Coach & Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-neon-green/30 rounded-lg bg-neon-green/5">
                  <h4 className="text-neon-green font-semibold mb-2 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Ask Your Coach
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Get personalized gaming advice, strategy tips, and performance insights
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={coachQuery}
                      onChange={(e) => setCoachQuery(e.target.value)}
                      placeholder="Ask about strategies, techniques, or gameplay..."
                      className="flex-1 bg-black/50 border-neon-green/30"
                    />
                    <Button onClick={askGamingCoach} className="cyber-button">
                      <Bot className="w-4 h-4 mr-2" />
                      Ask
                    </Button>
                  </div>
                </div>

                {coachResponse && (
                  <div className="p-4 border border-neon-cyan/30 rounded-lg bg-neon-cyan/5">
                    <h4 className="text-neon-cyan font-semibold mb-2">Coach Response:</h4>
                    <p className="text-white">{coachResponse}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-neon-purple/30 rounded-lg bg-neon-purple/5 text-center">
                    <Trophy className="w-8 h-8 mx-auto text-neon-purple mb-2" />
                    <h5 className="text-neon-purple font-semibold">Performance Analytics</h5>
                    <p className="text-xs text-gray-400">Coming Soon</p>
                  </div>
                  <div className="p-3 border border-neon-pink/30 rounded-lg bg-neon-pink/5 text-center">
                    <Star className="w-8 h-8 mx-auto text-neon-pink mb-2" />
                    <h5 className="text-neon-pink font-semibold">Skill Assessment</h5>
                    <p className="text-xs text-gray-400">Coming Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NFT Music Creator Tab */}
          <TabsContent value="music" className="space-y-4">
            <Card className="border-neon-green/30 bg-black/50">
              <CardHeader>
                <CardTitle className="text-neon-green flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  AI Music Creator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Textarea
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    placeholder="Describe the music you want to create... (e.g., 'Epic battle music with orchestral elements')"
                    className="bg-black/50 border-neon-green/30"
                  />
                  <select
                    value={musicGenre}
                    onChange={(e) => setMusicGenre(e.target.value)}
                    className="w-full p-2 bg-black/50 border border-neon-green/30 rounded text-white"
                  >
                    <option value="electronic">Electronic</option>
                    <option value="orchestral">Orchestral</option>
                    <option value="synthwave">Synthwave</option>
                    <option value="ambient">Ambient</option>
                    <option value="rock">Rock</option>
                  </select>
                  <Button onClick={requestAIMusic} className="w-full cyber-button">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate NFT Music
                  </Button>
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {musicRequests.map((request) => (
                      <div key={request.id} className="p-3 border border-neon-green/30 rounded-lg bg-neon-green/5">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-neon-green font-semibold text-sm">{request.prompt}</h5>
                          <Badge className={`text-xs ${
                            request.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            request.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">Genre: {request.genre}</p>
                        {request.status === 'completed' && (
                          <Button size="sm" className="mt-2 cyber-button text-xs">
                            Mint as NFT
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NFT AI Art Creator Tab */}
          <TabsContent value="art" className="space-y-4">
            <Card className="border-neon-pink/30 bg-black/50">
              <CardHeader>
                <CardTitle className="text-neon-pink flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  AI Art Creator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Textarea
                    value={artPrompt}
                    onChange={(e) => setArtPrompt(e.target.value)}
                    placeholder="Describe the artwork you want to create... (e.g., 'Cyberpunk warrior in neon city')"
                    className="bg-black/50 border-neon-pink/30"
                  />
                  <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="w-full p-2 bg-black/50 border border-neon-pink/30 rounded text-white"
                  >
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="anime">Anime</option>
                    <option value="realistic">Realistic</option>
                    <option value="abstract">Abstract</option>
                    <option value="pixel-art">Pixel Art</option>
                  </select>
                  <Button onClick={requestAIArt} className="w-full cyber-button">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate NFT Artwork
                  </Button>
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {artRequests.map((request) => (
                      <div key={request.id} className="p-3 border border-neon-pink/30 rounded-lg bg-neon-pink/5">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-neon-pink font-semibold text-sm">{request.prompt}</h5>
                          <Badge className={`text-xs ${
                            request.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            request.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">Style: {request.style}</p>
                        {request.status === 'completed' && request.imageUrl && (
                          <div className="mt-2 space-y-2">
                            <img 
                              src={request.imageUrl} 
                              alt="Generated art" 
                              className="w-full h-24 object-cover rounded border border-neon-pink/30"
                            />
                            <Button size="sm" className="cyber-button text-xs">
                              Mint as NFT
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
