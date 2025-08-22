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

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isGuest: boolean;
  walletAddress?: string;
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
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      username: 'CyberAdmin',
      message: 'Welcome to Cyber City Community HQ! 🎮',
      timestamp: new Date(Date.now() - 300000),
      isGuest: false
    },
    {
      id: '2',
      username: 'Player001',
      message: 'Ready for tonight\'s tournament! 🏆',
      timestamp: new Date(Date.now() - 120000),
      isGuest: true,
      walletAddress: 'ABC123...XYZ789'
    }
  ]);

  const [announcements] = useState<Announcement[]>([
    {
      id: '1',
      icon: '📢',
      title: 'Tournament Rules Updated',
      content: 'New scoring system implemented for fair gameplay. Check the latest rules in our tournament section.',
      timestamp: new Date(Date.now() - 86400000)
    },
    {
      id: '2',
      icon: '🏆',
      title: 'Weekly Championship',
      content: 'Join our weekly championship every Friday at 8PM EST. Prize pool: 1000 $CCTR tokens!',
      timestamp: new Date(Date.now() - 172800000)
    },
    {
      id: '3',
      icon: '🎁',
      title: 'How to Earn $CCTR',
      content: 'Participate in tournaments, complete daily challenges, trade NFTs, and engage with the community to earn rewards.',
      timestamp: new Date(Date.now() - 259200000)
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get username from authenticated user or wallet
  const getDisplayName = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username;
    if (user?.email) return user.email.split('@')[0];
    if (primaryWallet) return `Wallet_${primaryWallet.address.slice(0, 6)}`;
    return 'Anonymous';
  };

  // Connect Solana wallet function
  const connectSolanaWallet = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
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
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (currentMessage.trim() && (user || isWalletConnected)) {
      const newMessage: Message = {
        id: Date.now().toString(),
        username: getDisplayName(),
        message: currentMessage.trim(),
        timestamp: new Date(),
        isGuest: !user,
        walletAddress: primaryWallet?.address
      };
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');
      
      // Play arcade beep sound (optional)
      playArcadeBeep();
    }
  };

  const handleDiscordConnect = () => {
    console.log('Discord button clicked!'); // Debug log
    
    try {
      console.log('Opening Discord link...'); // Debug log
      
      // Show connecting toast
      toast({
        title: "Opening Discord...",
        description: "Taking you to our Discord server!",
      });
      
      // Try to open Discord link - use a more reliable approach
      const discordUrl = 'https://discord.gg/Y7yUUssH';
      
      // Create a temporary link element and click it (more reliable than window.open)
      const link = document.createElement('a');
      link.href = discordUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Provide success feedback after a short delay
      setTimeout(() => {
        toast({
          title: "Discord Link Opened! 🎮",
          description: "Welcome to the Cyber City Community!",
        });
      }, 500);
      
    } catch (error) {
      console.error('Discord connection error:', error);
      
      // Fallback: copy link to clipboard
      try {
        navigator.clipboard.writeText('https://discord.gg/Y7yUUssH');
        toast({
          title: "Link Copied to Clipboard! 📋",
          description: "Paste this link in your browser: discord.gg/Y7yUUssH",
        });
      } catch (clipboardError) {
        toast({
          title: "Manual Link Required",
          description: "Please visit: discord.gg/Y7yUUssH",
          variant: "destructive",
        });
      }
    }
  };

  const playArcadeBeep = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isAuthenticated = user || isWalletConnected;

  return (
    <section className="w-full">
      <div className="text-center mb-8">
        <h2 
          className="text-xl font-bold text-neon-pink"
          style={{
            fontFamily: 'Orbitron, monospace',
            textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
            filter: 'drop-shadow(0 0 8px #ff00ff)'
          }}
        >
          🕹️ CYBER CITY COMMUNITY HQ
        </h2>
        
        {/* Authentication Status Badge */}
        {isAuthenticated && (
          <div className="mt-4 flex justify-center">
            {user ? (
              <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan">
                👤 Logged in as {getDisplayName()}
              </Badge>
            ) : primaryWallet ? (
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                {getWalletIcon(primaryWallet.type)} Connected: {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
              </Badge>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* LEFT PANEL: Community Info */}
        <Card 
          className="overflow-hidden"
          style={{ 
            background: '#0f0f0f',
            border: '2px solid #00ffcc',
            borderRadius: '12px',
            boxShadow: `
              0 0 20px #00ffcc30,
              0 0 40px #ff00ff20,
              inset 0 0 20px #00ffcc05
            `
          }}
        >
          <CardHeader>
            <CardTitle className="text-neon-cyan font-display text-xl md:text-2xl flex items-center gap-2">
              📢 COMMUNITY UPDATES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    className="p-4 rounded-lg border border-neon-purple/30 bg-black/30 hover:bg-black/50 transition-all duration-300"
                    style={{ boxShadow: '0 0 10px #bf00ff20' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{announcement.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-neon-pink font-bold text-lg mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                          {announcement.content}
                        </p>
                        <span className="text-neon-cyan text-xs">
                          {formatDate(announcement.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
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
            borderRadius: '12px',
            boxShadow: `
              0 0 20px #ff00ff30,
              0 0 40px #00ffcc20,
              inset 0 0 20px #ff00ff05
            `
          }}
        >
          <CardHeader>
            <CardTitle className="text-neon-pink font-display text-xl md:text-2xl flex items-center gap-2">
              💬 LIVE CHAT
              <div className="flex items-center gap-1 text-sm text-neon-green">
                <Users size={16} />
                <span>{messages.length > 0 ? Math.floor(Math.random() * 50) + 10 : 0}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-96">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 mb-4 pr-2">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className="p-3 rounded-lg border border-neon-cyan/30 bg-black/40 hover:bg-black/60 transition-all duration-200"
                    style={{ boxShadow: '0 0 5px #00ffcc15' }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${message.isGuest ? 'text-neon-green' : 'text-neon-pink'}`}>
                          {message.username}
                          {!message.isGuest && <span className="text-neon-cyan ml-1">👑</span>}
                        </span>
                        {message.walletAddress && (
                          <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple text-xs">
                            💰 Wallet
                          </Badge>
                        )}
                      </div>
                      <span className="text-neon-purple text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm">
                      {message.message}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input or Connection Options */}
            {!isAuthenticated ? (
              <div className="space-y-3">
                {/* Discord Connect Button */}
                <Button 
                  onClick={handleDiscordConnect}
                  className="w-full hover:scale-105 transition-all duration-200 relative group"
                  style={{
                    background: 'linear-gradient(45deg, #5865F2, #4752C4)',
                    border: '1px solid #5865F2',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 0 15px rgba(88, 101, 242, 0.3)'
                  }}
                >
                  <MessageCircle size={16} className="mr-2" />
                  CONNECT TO DISCORD
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded"></span>
                </Button>

                {/* Wallet Connect Button */}
                <Button 
                  onClick={connectSolanaWallet}
                  className="w-full hover:scale-105 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(45deg, #00ffcc, #0088aa)',
                    border: '1px solid #00ffcc',
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                  disabled={loading}
                >
                  💰 CONNECT WALLET TO CHAT
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="w-full"
                  style={{
                    background: 'linear-gradient(45deg, #ff00ff, #aa0088)',
                    border: '1px solid #ff00ff',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                  disabled={loading}
                >
                  <Zap size={16} className="mr-2" />
                  {loading ? 'LOADING...' : 'OR LOGIN WITH EMAIL'}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-black/50 border-neon-pink text-white placeholder-gray-400"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  style={{
                    background: currentMessage.trim() 
                      ? 'linear-gradient(45deg, #ff00ff, #aa0088)' 
                      : 'gray',
                    border: '1px solid #ff00ff',
                    color: 'white'
                  }}
                >
                  <Send size={16} />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
