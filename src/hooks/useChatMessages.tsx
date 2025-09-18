import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  message: string;
  message_type: string;
  created_at: string;
}

export const useChatMessages = (roomId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  // Get display name for current user
  const getDisplayName = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username;
    if (user?.email) return user.email.split('@')[0];
    if (primaryWallet?.address) return `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`;
    return 'Anonymous';
  };

  // Fetch messages for current room
  const fetchMessages = async (currentRoomId: string) => {
    if (!currentRoomId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', currentRoomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (messageText: string) => {
    if (!roomId || !messageText.trim()) return;
    
    const isAuthenticated = isWalletConnected;
    if (!isAuthenticated) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to send messages",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a deterministic user ID from wallet address for wallet-only users
      const userId = user?.id || `wallet-${primaryWallet?.address?.slice(0, 8)}` || null;
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          username: getDisplayName(),
          message: messageText.trim(),
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    // Fetch initial messages
    fetchMessages(roomId);

    // Subscribe to new messages in this room
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('New message:', payload);
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId]);

  return {
    messages,
    loading,
    sendMessage,
    isAuthenticated: isWalletConnected,
    displayName: getDisplayName()
  };
};