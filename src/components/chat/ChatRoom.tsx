import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Send, 
  Users, 
  Smile, 
  MoreVertical,
  UserCheck,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  message_type: string;
  created_at: string;
}

interface Participant {
  id: string;
  username: string;
  joined_at: string;
  last_seen: string;
}

interface ChatRoomProps {
  roomId: string;
  onLeave: () => void;
  soundEnabled?: boolean;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, onLeave, soundEnabled = true }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomName, setRoomName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch room details
  const fetchRoomDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('name')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      setRoomName(data.name);
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch participants
  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          username: user.email?.split('@')[0] || 'Anonymous',
          message: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      inputRef.current?.focus();

      // Play send sound if enabled
      if (soundEnabled) {
        const audio = new Audio('/sounds/send.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {}); // Ignore errors
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Update last seen timestamp
  const updateLastSeen = async () => {
    if (!user) return;

    try {
      await supabase
        .from('room_participants')
        .upsert({
          room_id: roomId,
          user_id: user.id,
          username: user.email?.split('@')[0] || 'Anonymous',
          last_seen: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRoomDetails(),
        fetchMessages(),
        fetchParticipants()
      ]);
      setLoading(false);
      scrollToBottom();
    };

    loadData();

    // Set up realtime subscriptions
    const messagesChannel = supabase
      .channel(`chat-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          
          // Play notification sound for messages from others
          if (soundEnabled && newMsg.user_id !== user?.id) {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore errors
          }
          
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel(`participants-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    // Update last seen every 30 seconds
    const lastSeenInterval = setInterval(updateLastSeen, 30000);
    updateLastSeen(); // Initial update

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(participantsChannel);
      clearInterval(lastSeenInterval);
    };
  }, [roomId, user, soundEnabled]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto h-[600px] border-neon-cyan/20 bg-black/40">
        <CardHeader className="border-b border-neon-cyan/20">
          <div className="h-6 bg-neon-cyan/20 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="p-4 h-full">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-muted/20 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/20 rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-muted/20 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
        {/* Main Chat Area */}
        <Card className="lg:col-span-3 border-neon-cyan/20 bg-black/40 flex flex-col">
          {/* Header */}
          <CardHeader className="border-b border-neon-cyan/20 pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLeave}
                className="text-neon-cyan hover:bg-neon-cyan/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <CardTitle className="text-neon-cyan">
                # {roomName}
              </CardTitle>
              
              <Badge 
                variant="secondary"
                className="ml-auto bg-neon-purple/20 text-neon-purple border-neon-purple/30"
              >
                <Users className="w-3 h-3 mr-1" />
                {participants.length} online
              </Badge>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="group">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold text-black">
                        {msg.username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-neon-cyan text-sm">
                            {msg.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="text-sm text-foreground bg-muted/10 rounded-lg px-3 py-2 inline-block max-w-full break-words">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="border-t border-neon-cyan/20 p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Message #${roomName}...`}
                className="flex-1 bg-black/60 border-neon-cyan/30 focus:border-neon-cyan"
                disabled={!user}
                maxLength={500}
              />
              
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending || !user}
                size="sm"
                className="bg-neon-cyan text-black hover:bg-neon-cyan/80"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {!user && (
              <p className="text-xs text-muted-foreground mt-2">
                Please log in to send messages
              </p>
            )}
          </div>
        </Card>

        {/* Participants Sidebar */}
        <Card className="border-neon-cyan/20 bg-black/40">
          <CardHeader className="border-b border-neon-cyan/20 pb-4">
            <CardTitle className="text-sm text-neon-cyan flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              <div className="p-4 space-y-2">
                {participants.map((participant) => {
                  const isRecent = new Date(participant.last_seen) > new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
                  
                  return (
                    <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/10">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold text-black">
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                        {isRecent && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {participant.username}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {isRecent ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Active now
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(participant.last_seen), { addSuffix: true })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};