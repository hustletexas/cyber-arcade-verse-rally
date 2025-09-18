import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChatRooms, ChatRoom, ChatMessage } from '@/hooks/useChatRooms';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  Send, 
  Users, 
  ArrowLeft,
  Hash,
  User,
  Clock
} from 'lucide-react';

const MessageBubble: React.FC<{ message: ChatMessage; isOwnMessage: boolean }> = ({ 
  message, 
  isOwnMessage 
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className={`
          rounded-lg px-3 py-2 text-sm
          ${isOwnMessage 
            ? 'bg-neon-cyan text-black ml-2' 
            : 'bg-gray-700 text-white mr-2'
          }
        `}>
          {!isOwnMessage && (
            <div className="text-xs font-semibold text-neon-purple mb-1">
              {message.username}
            </div>
          )}
          <div className="break-words">{message.message}</div>
          <div className={`text-xs mt-1 opacity-70 ${isOwnMessage ? 'text-gray-800' : 'text-gray-300'}`}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomCard: React.FC<{ 
  room: ChatRoom; 
  onJoin: (room: ChatRoom) => void;
  participantCount: number;
}> = ({ room, onJoin, participantCount }) => (
  <Card className="border-neon-cyan/30 bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
        onClick={() => onJoin(room)}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-neon-cyan text-lg flex items-center gap-2">
          <Hash className="w-5 h-5" />
          {room.name}
        </CardTitle>
        <Badge variant="outline" className="text-neon-purple border-neon-purple">
          <Users className="w-3 h-3 mr-1" />
          {participantCount}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-gray-300 text-sm">{room.description}</p>
    </CardContent>
  </Card>
);

export const LiveChat: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const {
    rooms,
    currentRoom,
    messages,
    participants,
    loading,
    sending,
    joinRoom,
    leaveRoom,
    sendMessage
  } = useChatRooms();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;
    
    await sendMessage(messageInput);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getParticipantCount = (roomId: string) => {
    return participants.filter(p => p.room_id === roomId).length;
  };

  if (loading) {
    return (
      <Card className="border-neon-cyan/30 bg-black/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-neon-cyan">Loading chat rooms...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentRoom) {
    return (
      <Card className="border-neon-cyan/30 bg-black/20">
        <CardHeader>
          <CardTitle className="text-neon-cyan flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Live Chat Rooms
          </CardTitle>
          <p className="text-gray-300">Join a chat room to start talking with other users</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={joinRoom}
                participantCount={getParticipantCount(room.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
      {/* Main Chat Area */}
      <Card className="border-neon-cyan/30 bg-black/20 lg:col-span-3 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={leaveRoom}
                className="text-neon-purple hover:text-neon-cyan"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-neon-cyan flex items-center gap-2">
                <Hash className="w-5 h-5" />
                {currentRoom.name}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-neon-purple border-neon-purple">
              <Users className="w-3 h-3 mr-1" />
              {participants.length} online
            </Badge>
          </div>
          <p className="text-gray-300 text-sm">{currentRoom.description}</p>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-1">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Be the first to say something!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.user_id === user?.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t border-neon-cyan/30 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message #${currentRoom.name}`}
                className="flex-1 bg-black/40 border-neon-cyan/30 text-white placeholder-gray-400"
                disabled={sending || !user}
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={sending || !messageInput.trim() || !user}
                className="bg-neon-cyan text-black hover:bg-neon-cyan/80"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            {!user && (
              <p className="text-xs text-gray-500 mt-2">
                You need to be logged in to send messages
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants Sidebar */}
      <Card className="border-neon-cyan/30 bg-black/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-neon-cyan text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Online ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[480px]">
            <div className="space-y-2">
              {participants.map((participant) => {
                const isOnline = new Date(participant.last_seen) > new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
                return (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-black/40"
                  >
                    <div className="relative">
                      <User className="w-4 h-4 text-neon-purple" />
                      <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
                        isOnline ? 'bg-green-400' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{participant.username}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(participant.last_seen).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
  );
};