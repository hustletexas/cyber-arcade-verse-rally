import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle, Hash, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatRoom } from './ChatRoom';

interface ChatRoomData {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  max_participants: number;
  participant_count?: number;
  last_message?: string;
  last_message_time?: string;
}

export const ChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoomData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch chat rooms
  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          name,
          description,
          is_active,
          max_participants,
          created_at
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Get participant counts for each room
      const roomsWithCounts = await Promise.all(
        (data || []).map(async (room) => {
          const { count } = await supabase
            .from('room_participants')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id);

          return {
            ...room,
            participant_count: count || 0
          };
        })
      );

      setRooms(roomsWithCounts);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Join a chat room
  const joinRoom = async (roomId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join chat rooms",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert or update participant record
      const { error } = await supabase
        .from('room_participants')
        .upsert({
          room_id: roomId,
          user_id: user.id,
          username: user.email?.split('@')[0] || 'Anonymous',
          last_seen: new Date().toISOString()
        });

      if (error) throw error;

      setSelectedRoom(roomId);
      
      // Play join sound if enabled
      if (isSoundEnabled) {
        const audio = new Audio('/sounds/join.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join chat room",
        variant: "destructive",
      });
    }
  };

  // Leave current room
  const leaveRoom = () => {
    setSelectedRoom(null);
    
    // Play leave sound if enabled
    if (isSoundEnabled) {
      const audio = new Audio('/sounds/leave.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors
    }
  };

  useEffect(() => {
    fetchRooms();

    // Set up realtime subscription for room updates
    const channel = supabase
      .channel('chat-rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          fetchRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants'
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (selectedRoom) {
    return (
      <ChatRoom 
        roomId={selectedRoom} 
        onLeave={leaveRoom}
        soundEnabled={isSoundEnabled}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neon-cyan mb-2">
            💬 Live Chat Rooms
          </h2>
          <p className="text-muted-foreground">
            Join conversations with other players in real-time
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="text-neon-cyan hover:bg-neon-cyan/10"
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="ml-2 text-sm">
            {isSoundEnabled ? 'Sound On' : 'Sound Off'}
          </span>
        </Button>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-neon-cyan/20 bg-black/40">
              <CardHeader className="pb-3">
                <div className="h-6 bg-neon-cyan/20 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted/20 rounded animate-pulse" />
                  <div className="h-4 bg-muted/20 rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card 
              key={room.id} 
              className="border-neon-cyan/20 bg-black/40 hover:bg-black/60 transition-all duration-300 cursor-pointer group"
              onClick={() => joinRoom(room.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-neon-cyan">
                  <Hash className="w-4 h-4" />
                  {room.name}
                  <Badge 
                    variant="secondary" 
                    className="ml-auto bg-neon-purple/20 text-neon-purple border-neon-purple/30"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {room.participant_count || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {room.description}
                </p>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageCircle className="w-3 h-3" />
                    <span>Active now</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-neon-cyan text-black hover:bg-neon-cyan/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      joinRoom(room.id);
                    }}
                  >
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rooms.length === 0 && !loading && (
        <Card className="border-neon-cyan/20 bg-black/40 text-center py-8">
          <CardContent>
            <MessageCircle className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neon-cyan mb-2">No Chat Rooms Available</h3>
            <p className="text-muted-foreground">
              Chat rooms will appear here once they are created.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};