import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Users, Crown, Gamepad2, Brain, Zap, Loader2, RefreshCw, Trophy, Share2, Disc3, Award, Swords } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useToast } from '@/hooks/use-toast';
import { VoiceChat } from './VoiceChat';
import { useChatMessages } from '@/hooks/useChatMessages';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface WeeklyEntry {
  wallet_address: string;
  match_best_score: number;
  trivia_best_score: number;
  sequence_best_score: number;
  total_score: number;
  rank: number;
}

interface SharedItem {
  id: string;
  type: 'mix' | 'achievement' | 'tournament' | 'score';
  icon: string;
  title: string;
  description: string;
  username: string;
  timestamp: Date;
}

const gameEmoji: Record<string, string> = {
  'Cyber Match': '🃏',
  'Cyber Trivia': '🧠',
  'Cyber Sequence': '🔢',
};

const gameRoute: Record<string, string> = {
  'Cyber Match': '/cyber-match',
  'Cyber Trivia': '/cyber-trivia',
  'Cyber Sequence': '/cyber-sequence',
};

export const CommunityHub = () => {
  const { user, loading } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mainTab, setMainTab] = useState('feed');
  const [chatRoom, setChatRoom] = useState('00000000-0000-0000-0000-000000000002');

  const chatRooms = [
    { id: '00000000-0000-0000-0000-000000000002', name: 'Gamers', emoji: '🎮' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Social', emoji: '💬' },
  ];

  const { messages: chatMessages, loading: messagesLoading, sendMessage, displayName } = useChatMessages(chatRoom);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Leaderboard state
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  const {
    cccBalance, totalGamesPlayed, totalGamesThisWeek, weeklyBestTotal,
    gameStats, recentGames, isLoading: progressLoading, refetch: refetchProgress,
  } = usePlayerProgress();

  // Shared feed (simulated from recent activity)
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([
    { id: '1', type: 'mix', icon: '🎧', title: 'New DJ Mix Dropped!', description: 'NeonPlayer just finished a 5-minute live mix on the DJ Booth', username: 'NeonPlayer', timestamp: new Date(Date.now() - 120000) },
    { id: '2', type: 'achievement', icon: '🏆', title: 'DJ Rookie Badge Unlocked', description: 'CyberDJ_X claimed their first on-chain DJ achievement NFT', username: 'CyberDJ_X', timestamp: new Date(Date.now() - 300000) },
    { id: '3', type: 'score', icon: '🃏', title: 'Cyber Match High Score!', description: 'PixelQueen scored 12,450 pts in Cyber Match — new personal best!', username: 'PixelQueen', timestamp: new Date(Date.now() - 600000) },
    { id: '4', type: 'tournament', icon: '⚔️', title: 'Tournament Victory', description: 'GlitchMaster won the Weekly Cyber Trivia Championship', username: 'GlitchMaster', timestamp: new Date(Date.now() - 900000) },
    { id: '5', type: 'mix', icon: '🎵', title: 'Featured Mix!', description: 'SynthWave_99 had their mix featured on Cyber City Radio', username: 'SynthWave_99', timestamp: new Date(Date.now() - 1800000) },
    { id: '6', type: 'achievement', icon: '🔥', title: 'Neon Legend Achieved', description: 'ByteRunner unlocked the Neon Legend badge in Neon Match 36', username: 'ByteRunner', timestamp: new Date(Date.now() - 2400000) },
    { id: '7', type: 'score', icon: '🔢', title: 'Sequence Streak!', description: 'DataPunk hit a 25-round streak in Cyber Sequence', username: 'DataPunk', timestamp: new Date(Date.now() - 3600000) },
  ]);

  // Auto-refresh feed
  useEffect(() => {
    const interval = setInterval(() => {
      const templates: SharedItem[] = [
        { id: Date.now().toString(), type: 'mix', icon: '🎧', title: 'New Mix Shared!', description: `Player_${Math.floor(Math.random() * 9999)} just dropped a live mix on the DJ Booth`, username: `Player_${Math.floor(Math.random() * 9999)}`, timestamp: new Date() },
        { id: (Date.now() + 1).toString(), type: 'score', icon: '🎮', title: 'New High Score!', description: `Gamer_${Math.floor(Math.random() * 999)} scored ${Math.floor(Math.random() * 15000)} pts in Cyber Match`, username: `Gamer_${Math.floor(Math.random() * 999)}`, timestamp: new Date() },
        { id: (Date.now() + 2).toString(), type: 'achievement', icon: '⭐', title: 'Achievement Unlocked!', description: `Player_${Math.floor(Math.random() * 999)} earned the Speed Demon badge`, username: `Player_${Math.floor(Math.random() * 999)}`, timestamp: new Date() },
      ];
      const pick = templates[Math.floor(Math.random() * templates.length)];
      setSharedItems(prev => [pick, ...prev].slice(0, 20));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_combined_weekly_leaderboard');
      if (error) { console.error('Weekly leaderboard error:', error); return; }
      setEntries((data as WeeklyEntry[]) || []);
    } catch (err) { console.error('Failed to fetch weekly leaderboard:', err); }
    finally { setLbLoading(false); }
  }, []);

  useEffect(() => { fetchLeaderboard(); const iv = setInterval(fetchLeaderboard, 60000); return () => clearInterval(iv); }, [fetchLeaderboard]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const isAuthenticatedForChat = !!primaryWallet;
  const walletAddress = primaryWallet?.address;

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleVoiceMessage = (audioBlob: Blob, duration: number) => {
    console.log('Voice message received:', { audioBlob, duration });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelative = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const maskWallet = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Anon';
  const getRankIcon = (rank: number) => { if (rank === 1) return '🥇'; if (rank === 2) return '🥈'; if (rank === 3) return '🥉'; return `#${rank}`; };
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/15 to-transparent border-l-2 border-l-yellow-400";
      case 2: return "bg-gradient-to-r from-gray-400/10 to-transparent border-l-2 border-l-gray-400";
      case 3: return "bg-gradient-to-r from-orange-500/10 to-transparent border-l-2 border-l-orange-400";
      default: return "bg-black/20";
    }
  };

  const getItemBorder = (type: string) => {
    switch (type) {
      case 'mix': return 'border-l-2 border-l-neon-green';
      case 'achievement': return 'border-l-2 border-l-neon-pink';
      case 'tournament': return 'border-l-2 border-l-yellow-400';
      case 'score': return 'border-l-2 border-l-neon-cyan';
      default: return '';
    }
  };

  const weeklyGoal = 500;
  const progressPercentage = Math.min((weeklyBestTotal / weeklyGoal) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan mb-2">
          COMMUNITY HUB
        </h1>
        <p className="text-neon-green text-sm font-mono">
          Share • Chat • Compete • Earn
        </p>
      </div>

      <Card
        className="relative bg-black/30 backdrop-blur-md border-2 border-neon-cyan/40"
        style={{
          boxShadow: `0 0 20px #00ffcc20, 0 0 40px #ff00ff15, inset 0 0 20px #00ffcc05`,
        }}
      >
        {/* Main Tabs */}
        <CardHeader className="pb-2">
          <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-sm border border-neon-cyan/20">
              <TabsTrigger
                value="feed"
                className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green data-[state=active]:shadow-neon-glow font-mono text-xs sm:text-sm"
              >
                <Share2 className="w-3 h-3 mr-1 sm:mr-2" />
                Feed
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink data-[state=active]:shadow-neon-glow font-mono text-xs sm:text-sm"
              >
                <Send className="w-3 h-3 mr-1 sm:mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan data-[state=active]:shadow-neon-glow font-mono text-xs sm:text-sm"
              >
                <Crown className="w-3 h-3 mr-1 sm:mr-2" />
                Rankings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="pt-2">
          {/* ============ FEED TAB ============ */}
          {mainTab === 'feed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-neon-green flex items-center gap-2">
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  Live Activity Feed
                </h3>
                <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs border-neon-cyan/30">
                  {sharedItems.length} updates
                </Badge>
              </div>

              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-2">
                  {sharedItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3 rounded-lg bg-black/30 hover:bg-black/50 transition-all duration-200",
                        getItemBorder(item.type)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-neon-cyan">{item.username}</span>
                            <Badge
                              className={cn(
                                "text-[10px] h-4 px-1.5",
                                item.type === 'mix' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' :
                                item.type === 'achievement' ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/30' :
                                item.type === 'tournament' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30'
                              )}
                            >
                              {item.type === 'mix' ? 'DJ Mix' : item.type === 'achievement' ? 'Badge' : item.type === 'tournament' ? 'Tournament' : 'Score'}
                            </Badge>
                            <span className="text-[10px] text-gray-500 ml-auto flex-shrink-0">
                              {formatRelative(item.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-200 mb-0.5">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 justify-center pt-3 border-t border-neon-cyan/10">
                <Button size="sm" variant="outline" className="border-neon-green/50 text-neon-green hover:bg-neon-green/10 text-xs" onClick={() => navigate('/dj')}>
                  <Disc3 className="w-3 h-3 mr-1" /> DJ Booth
                </Button>
                <Button size="sm" variant="outline" className="border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10 text-xs" onClick={() => navigate('/cyber-match')}>
                  🃏 Cyber Match
                </Button>
                <Button size="sm" variant="outline" className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 text-xs" onClick={() => navigate('/tournaments')}>
                  <Swords className="w-3 h-3 mr-1" /> Tournaments
                </Button>
              </div>
            </div>
          )}

          {/* ============ CHAT TAB ============ */}
          {mainTab === 'chat' && (
            <div className="space-y-3">
              {/* Room Selector */}
              <div className="flex gap-1 bg-black/30 rounded-lg p-1">
                {chatRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setChatRoom(room.id)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all",
                      chatRoom === room.id
                        ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/30"
                        : "text-gray-400 hover:text-gray-300 hover:bg-black/20"
                    )}
                  >
                    {room.emoji} {room.name}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <ScrollArea className="h-[320px] pr-2">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-neon-cyan text-sm">Loading messages...</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatMessages?.map((message) => (
                      <div
                        key={message.id}
                        className="p-2 rounded-lg border border-neon-cyan/20 bg-black/30 hover:bg-black/50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-bold text-xs text-neon-cyan">{message.username}</span>
                          <span className="text-gray-500 text-[10px]">{formatTime(message.created_at)}</span>
                        </div>
                        <p className="text-gray-200 text-xs">{message.message}</p>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input */}
              {!isAuthenticatedForChat ? (
                <div className="text-center p-4">
                  <Button
                    onClick={() => toast({ title: "Connect Wallet", description: "Use the wallet button in the header to connect your Stellar wallet" })}
                    className="w-full h-10 text-sm hover:scale-105 transition-all duration-200"
                    style={{ background: 'linear-gradient(45deg, #14b9ff, #00d4aa)', color: 'black', fontWeight: 'bold' }}
                    disabled={loading}
                  >
                    CONNECT WALLET TO CHAT
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">Connect your Stellar wallet to join the conversation</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <VoiceChat onVoiceMessage={handleVoiceMessage} isConnected={!!isAuthenticatedForChat} />
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${chatRooms.find(r => r.id === chatRoom)?.name}...`}
                      className="bg-black/30 border-neon-cyan/30 text-white placeholder:text-gray-400 h-8 text-xs"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} className="cyber-button px-3 h-8" disabled={!newMessage.trim()}>
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ LEADERBOARD TAB ============ */}
          {mainTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neon-cyan flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  Weekly Rankings
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { fetchLeaderboard(); refetchProgress(); }}
                    className="text-muted-foreground hover:text-neon-cyan h-7 w-7 p-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-neon-green flex items-center gap-1">
                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" /> Live
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Top 3 earn rewards every Monday (min <span className="text-neon-cyan font-bold">5 players</span>)
              </p>

              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 uppercase px-3">
                <span className="col-span-1">#</span>
                <span className="col-span-3">Player</span>
                <span className="col-span-2 text-center">Match</span>
                <span className="col-span-2 text-center">Seq</span>
                <span className="col-span-2 text-center">Trivia</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {lbLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No scores this week yet. Play to claim the top spot!</p>
                </div>
              ) : (
                <ScrollArea className="h-[260px]">
                  <div className="space-y-2">
                    {entries.slice(0, 10).map((entry) => {
                      const isYou = walletAddress && entry.wallet_address === walletAddress;
                      return (
                        <div
                          key={entry.wallet_address}
                          className={cn(
                            "grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg transition-all",
                            getRankStyle(entry.rank),
                            isYou && "ring-1 ring-neon-cyan/50"
                          )}
                        >
                          <span className={cn("col-span-1 font-bold text-sm",
                            entry.rank === 1 ? "text-yellow-400" : entry.rank === 2 ? "text-gray-300" : entry.rank === 3 ? "text-orange-400" : "text-gray-500"
                          )}>
                            {getRankIcon(entry.rank)}
                          </span>
                          <span className="col-span-3 text-xs text-gray-300 truncate">
                            {maskWallet(entry.wallet_address)}
                            {isYou && <span className="ml-1 text-neon-cyan text-[10px]">(You)</span>}
                          </span>
                          <span className="col-span-2 text-center text-xs text-neon-pink font-medium">
                            {entry.match_best_score > 0 ? entry.match_best_score.toLocaleString() : '-'}
                          </span>
                          <span className="col-span-2 text-center text-xs text-purple-400 font-medium">
                            {entry.sequence_best_score > 0 ? entry.sequence_best_score.toLocaleString() : '-'}
                          </span>
                          <span className="col-span-2 text-center text-xs text-neon-cyan font-medium">
                            {entry.trivia_best_score > 0 ? entry.trivia_best_score.toLocaleString() : '-'}
                          </span>
                          <span className="col-span-2 text-right text-xs text-white font-bold">
                            {entry.total_score.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {/* Reward Tiers */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neon-cyan/10">
                {[
                  { place: '1st', emoji: '🥇', reward: '50 CCC' },
                  { place: '2nd', emoji: '🥈', reward: '25 CCC' },
                  { place: '3rd', emoji: '🥉', reward: '10 CCC' },
                ].map((tier) => (
                  <div key={tier.place} className="text-center p-2 rounded-lg bg-black/20">
                    <div className="text-lg">{tier.emoji}</div>
                    <div className="text-xs text-gray-400 mt-1">{tier.reward}</div>
                  </div>
                ))}
              </div>

              {/* Quick Play Buttons */}
              <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-neon-cyan/10">
                <Button size="sm" className="cyber-button text-xs" onClick={() => navigate('/cyber-match')}>
                  🃏 Cyber Match
                </Button>
                <Button size="sm" variant="outline" className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black text-xs" onClick={() => navigate('/cyber-trivia')}>
                  🧠 Trivia
                </Button>
                <Button size="sm" variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black text-xs" onClick={() => navigate('/cyber-sequence')}>
                  🔢 Sequence
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
