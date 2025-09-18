import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  max_participants: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  message: string;
  message_type: string;
  created_at: string;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  joined_at: string;
  last_seen: string;
}

export const useChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all active chat rooms
  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
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
  const joinRoom = async (room: ChatRoom) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join chat rooms",
        variant: "destructive",
      });
      return;
    }

    try {
      setCurrentRoom(room);
      
      // Get username from profile or use email
      const username = user.email?.split('@')[0] || 'Anonymous';
      
      // Insert or update participant record
      const { error: participantError } = await supabase
        .from('room_participants')
        .upsert({
          room_id: room.id,
          user_id: user.id,
          username: username,
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'room_id,user_id'
        });

      if (participantError) throw participantError;

      // Fetch messages for this room
      await fetchMessages(room.id);
      await fetchParticipants(room.id);
      
      toast({
        title: "Joined Room",
        description: `Welcome to ${room.name}!`,
      });
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
  const leaveRoom = async () => {
    if (!currentRoom || !user) return;

    try {
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', currentRoom.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentRoom(null);
      setMessages([]);
      setParticipants([]);
      
      toast({
        title: "Left Room",
        description: "You have left the chat room",
      });
    } catch (error) {
      console.error('Error leaving room:', error);
      toast({
        title: "Error",
        description: "Failed to leave chat room",
        variant: "destructive",
      });
    }
  };

  // Fetch messages for a room
  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100); // Limit to last 100 messages

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch participants for a room
  const fetchParticipants = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  // Send a message
  const sendMessage = async (message: string) => {
    if (!currentRoom || !user || !message.trim()) return;

    setSending(true);
    try {
      const username = user.email?.split('@')[0] || 'Anonymous';
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoom.id,
          user_id: user.id,
          username: username,
          message: message.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Update participant's last_seen
      await supabase
        .from('room_participants')
        .update({ last_seen: new Date().toISOString() })
        .eq('room_id', currentRoom.id)
        .eq('user_id', user.id);

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

  // Set up realtime subscriptions
  useEffect(() => {
    if (!currentRoom) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`room-${currentRoom.id}-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Subscribe to participant changes
    const participantsChannel = supabase
      .channel(`room-${currentRoom.id}-participants`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${currentRoom.id}`
        },
        () => {
          // Refetch participants on any change
          fetchParticipants(currentRoom.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [currentRoom]);

  // Initial load
  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    currentRoom,
    messages,
    participants,
    loading,
    sending,
    joinRoom,
    leaveRoom,
    sendMessage,
    refetchRooms: fetchRooms
  };
};