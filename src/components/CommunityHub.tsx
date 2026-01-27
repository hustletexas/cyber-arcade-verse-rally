import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users, Zap, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useToast } from '@/hooks/use-toast';
import { VoiceChat } from './VoiceChat';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { useChatMessages } from '@/hooks/useChatMessages';
import { supabase } from '@/integrations/supabase/client';
import { WalletStatusBar } from '@/components/WalletStatusBar';

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
  
  const [selectedRoomId, setSelectedRoomId] = useState<string>('00000000-0000-0000-0000-000000000001');
  const [newMessage, setNewMessage] = useState('');
  
  const chatRooms = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Crypto', description: 'Crypto Hub' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Gamers', description: 'Gamers Lounge' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Social', description: 'Social Circle' }
  ];
  
  // Use the chat messages hook
  const { 
    messages: chatMessages, 
    loading: messagesLoading, 
    sendMessage, 
    isAuthenticated,
    displayName 
  } = useChatMessages(selectedRoomId);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [liveUpdates, setLiveUpdates] = useState<Announcement[]>([
    { id: '1', icon: '🔥', title: 'BREAKING', content: 'CyberPlayer_X just hit a 50-kill streak in Tournament Arena!', timestamp: new Date() },
    { id: '2', icon: '💰', title: 'MARKET ALERT', content: 'CCTR token surged 23% - Trading volume at all-time high!', timestamp: new Date() },
    { id: '3', icon: '🎮', title: 'LIVE NOW', content: 'Grand Championship final round starting - 127 players competing!', timestamp: new Date() },
    { id: '4', icon: '🎵', title: 'NEW DROP', content: 'Cyber Symphony Vol. 3 just dropped - 1,250 downloads in first hour!', timestamp: new Date() },
    { id: '5', icon: '🏆', title: 'ACHIEVEMENT', content: 'NeonGamer unlocked legendary status - First player to reach Level 100!', timestamp: new Date() },
    { id: '6', icon: '⚡', title: 'ENERGY SURGE', content: 'Network hash rate increased 45% - Mining rewards boosted!', timestamp: new Date() },
    { id: '7', icon: '🔮', title: 'PREDICTION', content: 'AI Oracle forecasts: Next tournament prize pool will exceed 100K CCTR!', timestamp: new Date() },
    { id: '8', icon: '🌟', title: 'COMMUNITY', content: 'Discord members hit 50K milestone - Celebrating with bonus rewards!', timestamp: new Date() }
  ]);

  // Auto-update live feed
  useEffect(() => {
    const interval = setInterval(() => {
      const newUpdates = [
        { id: Date.now().toString(), icon: '🎯', title: 'LIVE', content: `Player ${Math.floor(Math.random() * 9999)} just earned ${Math.floor(Math.random() * 500)} CCTR tokens!`, timestamp: new Date() },
        { id: (Date.now() + 1).toString(), icon: '🚀', title: 'BOOST', content: `Network activity up ${Math.floor(Math.random() * 50)}% in the last 5 minutes!`, timestamp: new Date() },
        { id: (Date.now() + 2).toString(), icon: '💎', title: 'RARE', content: `Legendary NFT just minted - Current bid: ${Math.floor(Math.random() * 10)}K CCTR!`, timestamp: new Date() }
      ];
      
      setLiveUpdates(prev => [...newUpdates, ...prev].slice(0, 12));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isAuthenticatedForChat = isWalletConnected;
  
  const handleDiscordConnect = () => {
    window.open('https://discord.gg/cybercityarcade', '_blank');
  };

  const handleStellarConnect = async () => {
    // Wallet connection is now handled via WalletConnectionModal
    // This function shows guidance for users
    toast({
      title: "Connect Wallet",
      description: "Please use the wallet button in the header to connect your Stellar wallet",
    });
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
          <div className="mt-4 max-w-md mx-auto">
            <WalletStatusBar />
          </div>
        </div>

        {/* HQ UPDATES SECTION - Full Width */}
        <Card 
          className="mb-6 relative"
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
            <CardTitle className="text-neon-cyan font-display text-xl flex items-center gap-3">
              📢 HQ COMMAND CENTER
              <Badge className="bg-neon-pink text-black animate-pulse text-sm">LIVE</Badge>
              <Badge className="bg-neon-green text-black animate-pulse text-sm">UPDATES</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-80 relative">
            {/* Gradient overlays */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/95 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/95 to-transparent z-10 pointer-events-none" />
            
            {/* Live teleprompter feed */}
            <div className="overflow-hidden h-full">
              <div className="animate-teleprompter space-y-3 p-6">
                {/* Multiple copies for seamless loop */}
                {Array.from({ length: 6 }, (_, groupIndex) => 
                  liveUpdates.map((update, index) => (
                    <div 
                      key={`${update.id}-${groupIndex}-${index}`}
                      className="flex items-center gap-4 p-3 rounded-lg border border-neon-cyan/30 bg-black/40 backdrop-blur-sm flex-shrink-0"
                      style={{ 
                        boxShadow: '0 0 15px #00ffcc20',
                        minHeight: '70px'
                      }}
                    >
                      <span className="text-2xl flex-shrink-0">{update.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge 
                            className={`${
                              update.title === 'BREAKING' ? 'bg-red-500 text-white animate-pulse font-bold' :
                              update.title === 'LIVE' ? 'bg-neon-green text-black animate-pulse font-bold' :
                              update.title === 'MARKET ALERT' ? 'bg-yellow-500 text-black animate-pulse font-bold' :
                              'bg-neon-cyan/30 text-neon-cyan font-bold'
                            } text-sm h-6 px-3`}
                          >
                            {update.title}
                          </Badge>
                          <span className="text-neon-purple text-sm font-mono">
                            {update.timestamp.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-100 text-sm leading-relaxed font-medium">
                          {update.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LIVE CHAT SECTION - Full Width Below HQ */}
        <Card 
          className="relative"
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
            <CardTitle className="text-neon-pink font-display text-xl flex items-center gap-3">
              💬 LIVE COMMUNITY CHAT
              <div className="flex items-center gap-2 text-sm text-neon-green">
                <Users size={16} />
                <span>{chatMessages?.length || 0}</span>
              </div>
            </CardTitle>
            
            <Tabs value={selectedRoomId} onValueChange={setSelectedRoomId} className="w-full mt-3">
              <TabsList className="grid w-full grid-cols-3 bg-card/20 backdrop-blur-sm border border-neon-cyan/20">
                {chatRooms.map((room) => (
                  <TabsTrigger 
                    key={room.id} 
                    value={room.id}
                    className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan data-[state=active]:shadow-neon-glow font-mono text-sm"
                  >
                        {room.id === '00000000-0000-0000-0000-000000000001' && '₿'} 
                        {room.id === '00000000-0000-0000-0000-000000000002' && '🎮'} 
                        {room.id === '00000000-0000-0000-0000-000000000003' && '💬'}
                    {room.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
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
              <div className="text-center p-4">
                {/* Stellar Wallet Connect Only */}
                <Button 
                  onClick={handleStellarConnect}
                  className="w-full h-10 text-sm hover:scale-105 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(45deg, #14b9ff, #00d4aa)',
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                  disabled={loading}
                >
                  CONNECT WALLET TO CHAT
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Connect your Stellar wallet to join the conversation
                </p>
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
                     placeholder={`Message ${chatRooms.find(r => r.id === selectedRoomId)?.name}...`}
                     className="bg-black/30 border-neon-cyan/30 text-white placeholder:text-gray-400 h-8 text-xs"
                     onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                   />
                   <Button 
                     onClick={handleSendMessage}
                     className="cyber-button px-3 h-8"
                     disabled={!newMessage.trim()}
                   >
                     <Send size={14} />
                   </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};