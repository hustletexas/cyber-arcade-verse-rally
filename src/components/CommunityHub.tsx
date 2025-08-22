
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users, Zap, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

interface Announcement {
  id: string;
  icon: string;
  title: string;
  content: string;
  timestamp: Date;
}

export const CommunityHub = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { messages, isLoading: chatLoading, sendMessage, isConnected } = useRealtimeChat();
  
  const [announcements] = useState<Announcement[]>([
    {
      id: '1',
      icon: '📢',
      title: 'Live Chat Now Available!',
      content: 'Join our real-time community chat! Connect with other players instantly without needing Discord.',
      timestamp: new Date(Date.now() - 3600000)
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() && user) {
      await sendMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

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
              <div className="flex items-center gap-2 text-sm">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-neon-green">
                    <Wifi size={16} />
                    <span>LIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400">
                    <WifiOff size={16} />
                    <span>OFFLINE</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-neon-green">
                  <Users size={16} />
                  <span>{messages.length > 0 ? Math.floor(Math.random() * 50) + 10 : 0}</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-96">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 mb-4 pr-2">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full text-neon-cyan">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
                  <span className="ml-2">Loading chat...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className="p-3 rounded-lg border border-neon-cyan/30 bg-black/40 hover:bg-black/60 transition-all duration-200"
                      style={{ boxShadow: '0 0 5px #00ffcc15' }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className={`font-bold text-sm ${message.is_admin ? 'text-neon-pink' : 'text-neon-green'}`}>
                          {message.username}
                          {message.is_admin && <span className="text-neon-cyan ml-1">👑</span>}
                        </span>
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
              )}
            </ScrollArea>

            {/* Chat Input */}
            {!user ? (
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="w-full"
                  style={{
                    background: 'linear-gradient(45deg, #00ffcc, #0088aa)',
                    border: '1px solid #00ffcc',
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                  disabled={loading}
                >
                  <Zap size={16} className="mr-2" />
                  {loading ? 'LOADING...' : 'LOGIN TO JOIN CHAT'}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-black/50 border-neon-pink text-white placeholder-gray-400"
                  disabled={!isConnected}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || !isConnected}
                  style={{
                    background: currentMessage.trim() && isConnected
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
