import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Zap, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useToast } from '@/hooks/use-toast';
import { VoiceChat } from './VoiceChat';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { useChatMessages } from '@/hooks/useChatMessages';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  username: string;
  message?: string;
  timestamp: Date;
  isGuest: boolean;
  walletAddress?: string;
  type: 'text' | 'voice';
  audioBlob?: Blob;
  duration?: number;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  max_participants: number;
  is_active: boolean;
}

interface Announcement {
  id: string;
  icon: string;
  title: string;
  content: string;
  timestamp: Date;
}

export const CommunityHub = () => {
  const { user, loading } = useAuth();
  const { primaryWallet, isWalletConnected, connectWallet, getWalletIcon } = useMultiWallet();
  const { createOrLoginWithWallet } = useWalletAuth();
  const { toast } = useToast();
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Use the chat messages hook
  const { 
    messages: chatMessages, 
    loading: messagesLoading, 
    sendMessage, 
    isAuthenticated,
    displayName 
  } = useChatMessages(selectedRoom?.id || null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [announcements] = useState<Announcement[]>([
    {
      id: '1',
      icon: '🎮',
      title: 'Tournament Alert',
      content: 'Grand Championship starts in 2 hours! Prize pool: 50,000 $CCTR',
      timestamp: new Date()
    },
    {
      id: '2',
      icon: '🎵',
      title: 'New Music Drop',
      content: 'Cyber Symphony Vol. 3 now available in the music marketplace!',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      icon: '💰',
      title: 'Staking Rewards',
      content: 'Weekly staking rewards distributed! Check your wallet.',
      timestamp: new Date(Date.now() - 7200000)
    }
  ]);
  
  // Fetch chat rooms on component mount
  useEffect(() => {
    const fetchChatRooms = async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching chat rooms:', error);
        return;
      }
      
      setChatRooms(data || []);
      // Auto-select first room
      if (data && data.length > 0) {
        setSelectedRoom(data[0]);
      }
    };
    
    fetchChatRooms();
  }, []);

  const isAuthenticatedForChat = user || isWalletConnected;
  
  const handleDiscordConnect = () => {
    window.open('https://discord.gg/cybercityarcade', '_blank');
  };

  const handlePhantomConnect = async () => {
    try {
      if (typeof window !== 'undefined' && 'solana' in window) {
        const provider = (window as any).solana;
        if (provider?.isPhantom) {
          const response = await provider.connect();
          if (response?.publicKey) {
            await connectWallet('phantom', response.publicKey.toString());
            await createOrLoginWithWallet(response.publicKey.toString());
            toast({
              title: "Wallet Connected!",
              description: "You can now participate in the chat",
            });
          }
        } else {
          toast({
            title: "Phantom Wallet Required",
            description: "Please install Phantom wallet to connect",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Phantom connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleVoiceMessage = (audioBlob: Blob, duration: number) => {
    // For now, we'll show a placeholder for voice messages
    // In a full implementation, you'd upload the audio and store a reference
    console.log('Voice message received:', { audioBlob, duration });
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-gradient-to-br from-black via-purple-900/20 to-black p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan mb-2">
            COMMUNITY HQ
          </h1>
          <p className="text-neon-green text-base font-mono">
            Connect • Chat • Compete • Earn
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT PANEL: Announcements */}
          <Card 
            className="overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)',
              border: '2px solid #00ffcc',
              boxShadow: `
                0 0 20px #00ffcc30,
                0 0 40px #ff00ff20,
                inset 0 0 20px #00ffcc05
              `
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-neon-cyan font-display text-lg flex items-center gap-2">
                📢 HQ UPDATES
                <Badge className="bg-neon-pink text-black animate-pulse text-xs">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <Card 
                      key={announcement.id} 
                      className="p-3 border border-neon-purple/30 bg-black/20 hover:bg-black/40 transition-all duration-200 cursor-pointer"
                      style={{ boxShadow: '0 0 10px #ff00ff15' }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{announcement.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-neon-pink text-xs mb-1">
                            {announcement.title}
                          </h3>
                          <p className="text-gray-300 text-xs leading-relaxed">
                            {announcement.content}
                          </p>
                          <span className="text-neon-purple text-xs mt-1 block">
                            {announcement.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* RIGHT PANEL: Live Chat */}
          <Card 
            className="overflow-hidden"
            style={{ 
              background: '#0f0f0f',
              border: '2px solid #ff00ff',
              boxShadow: `
                0 0 20px #ff00ff30,
                0 0 40px #00ffcc20,
                inset 0 0 20px #ff00ff05
              `
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-neon-pink font-display text-lg flex items-center gap-2">
                💬 LIVE CHAT
                <div className="flex items-center gap-1 text-xs text-neon-green">
                  <Users size={14} />
                  <span>{chatMessages?.length || 0}</span>
                </div>
              </CardTitle>
              
              {/* Chat Room Selection */}
              <div className="flex flex-wrap gap-1 mt-2">
                {chatRooms.map((room) => (
                  <Button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    variant={selectedRoom?.id === room.id ? "default" : "outline"}
                    size="sm"
                    className={`text-xs h-7 px-2 ${
                      selectedRoom?.id === room.id 
                        ? 'bg-neon-cyan text-black border-neon-cyan' 
                        : 'border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black'
                    }`}
                  >
                    {room.name === 'Crypto Hub' && '₿'} 
                    {room.name === 'Gamers Lounge' && '🎮'} 
                    {room.name === 'Social Circle' && '💬'} 
                    {room.name}
                  </Button>
                ))}
              </div>
              
              {selectedRoom && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedRoom.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="flex flex-col h-80">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 mb-3 pr-2">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-neon-cyan text-sm">Loading messages...</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatMessages?.map((message) => (
                      <div 
                        key={message.id}
                        className="p-2 rounded-lg border border-neon-cyan/30 bg-black/40 hover:bg-black/60 transition-all duration-200"
                        style={{ boxShadow: '0 0 5px #00ffcc15' }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-neon-cyan">
                              {message.username}
                            </span>
                            <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple text-xs h-4 px-1">
                              💬
                            </Badge>
                          </div>
                          <span className="text-neon-purple text-xs">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        
                        {/* Message Content */}
                        <p className="text-gray-200 text-xs">
                          {message.message}
                        </p>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input or Connection Options */}
              {!isAuthenticatedForChat ? (
                <div className="space-y-2">
                  {/* Discord Connect Button */}
                  <Button 
                    onClick={handleDiscordConnect}
                    className="w-full h-8 text-xs hover:scale-105 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(45deg, #5865F2, #4752C4)',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    💬 JOIN DISCORD
                  </Button>
                  
                  {/* Phantom Wallet Connect */}
                  <Button 
                    onClick={handlePhantomConnect}
                    className="w-full h-8 text-xs hover:scale-105 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(45deg, #AB9FF2, #9CA3FF)',
                      color: 'black',
                      fontWeight: 'bold'
                    }}
                    disabled={loading}
                  >
                    💰 CONNECT WALLET
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full h-8 text-xs"
                    variant="outline"
                    style={{
                      borderColor: '#00ffcc',
                      color: '#00ffcc',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? 'LOADING...' : 'EMAIL LOGIN'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Voice Chat Component */}
                  <VoiceChat 
                    onVoiceMessage={handleVoiceMessage}
                    isConnected={!!isAuthenticatedForChat}
                  />
                  
                  {/* Text Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={selectedRoom ? `Message ${selectedRoom.name}...` : "Select a room to chat"}
                      className="bg-black/30 border-neon-cyan/30 text-white placeholder:text-gray-400 h-8 text-xs"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={!selectedRoom}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="cyber-button px-3 h-8"
                      disabled={!selectedRoom || !newMessage.trim()}
                    >
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Compact Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <Card className="holographic p-2 text-center">
            <div className="text-lg mb-1">🎮</div>
            <div className="text-lg font-black text-neon-cyan">2,847</div>
            <p className="text-xs text-muted-foreground">Players</p>
          </Card>
          
          <Card className="holographic p-2 text-center">
            <div className="text-lg mb-1">💰</div>
            <div className="text-lg font-black text-neon-green">₿127.5K</div>
            <p className="text-xs text-muted-foreground">Prize Pool</p>
          </Card>
          
          <Card className="holographic p-2 text-center">
            <div className="text-lg mb-1">🏆</div>
            <div className="text-lg font-black text-neon-purple">24</div>
            <p className="text-xs text-muted-foreground">Tournaments</p>
          </Card>
          
          <Card className="holographic p-2 text-center">
            <div className="text-lg mb-1">🎵</div>
            <div className="text-lg font-black text-neon-pink">1,250</div>
            <p className="text-xs text-muted-foreground">Tracks</p>
          </Card>
        </div>
      </div>
    </div>
  );
};