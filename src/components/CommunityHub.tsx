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
            <TabsList className="grid w-full grid-cols-2 bg-black/40 backdrop-blur-sm border border-neon-cyan/20">
              <TabsTrigger
                value="feed"
                className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green data-[state=active]:shadow-neon-glow font-mono text-xs sm:text-sm"
              >
                <Share2 className="w-3 h-3 mr-1 sm:mr-2" />
                Feed & Chat
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

              {/* Chat Section under Feed */}
              <div className="pt-3 border-t border-neon-cyan/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neon-pink flex items-center gap-2">
                    <Send className="w-3 h-3" />
                    Live Chat
                  </h3>
                  <div className="flex gap-1">
                    {chatRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setChatRoom(room.id)}
                        className={cn(
                          "py-1 px-2 rounded text-[10px] font-medium transition-all",
                          chatRoom === room.id
                            ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/30"
                            : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        {room.emoji} {room.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Messages (compact) */}
                <ScrollArea className="h-[140px] pr-2">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-neon-cyan text-xs">Loading messages...</div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {chatMessages?.slice(-10).map((message) => (
                        <div
                          key={message.id}
                          className="px-2 py-1.5 rounded bg-black/30 hover:bg-black/50 transition-all duration-200"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-[10px] text-neon-cyan flex-shrink-0">{message.username}</span>
                            <p className="text-gray-200 text-xs truncate flex-1">{message.message}</p>
                            <span className="text-gray-600 text-[9px] flex-shrink-0">{formatTime(message.created_at)}</span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Chat Input */}
                {!isAuthenticatedForChat ? (
                  <Button
                    onClick={() => toast({ title: "Connect Wallet", description: "Use the wallet button in the header to connect your Stellar wallet" })}
                    className="w-full h-8 text-xs hover:scale-105 transition-all duration-200"
                    style={{ background: 'linear-gradient(45deg, #14b9ff, #00d4aa)', color: 'black', fontWeight: 'bold' }}
                    disabled={loading}
                  >
                    CONNECT WALLET TO CHAT
                  </Button>
                ) : (
                  <div className="space-y-1">
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

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 justify-center pt-3 border-t border-neon-cyan/10">
                <Button size="sm" variant="outline" className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 text-xs" onClick={() => navigate('/tournaments')}>
                  <Swords className="w-3 h-3 mr-1" /> Tournaments
                </Button>
              </div>
            </div>
          )}

          {/* ============ LEADERBOARD TAB ============ */}
          {mainTab === 'leaderboard' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-neon-cyan to-neon-pink flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Leaderboard
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

              {/* Time Period Tabs */}
              <div className="flex gap-1 text-xs font-mono">
                {['Weekly', 'All-time'].map((period) => (
                  <button key={period} className={cn(
                    "px-3 py-1 rounded-md transition-all",
                    period === 'Weekly'
                      ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                      : "text-gray-500 hover:text-gray-300"
                  )}>
                    {period}
                  </button>
                ))}
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
                <>
                  {/* === TOP 3 PODIUM === */}
                  <div className="flex items-end justify-center gap-2 sm:gap-3 py-4">
                    {/* 2nd Place */}
                    {entries.length >= 2 && (
                      <div className="flex flex-col items-center w-[30%] max-w-[120px]">
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-400 bg-gradient-to-br from-gray-600/30 to-gray-800/50 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(156,163,175,0.3)]">
                            <span className="text-2xl sm:text-3xl">🥈</span>
                          </div>
                          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-black shadow-lg">2</div>
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-300 mt-2 truncate w-full text-center font-medium">
                          {maskWallet(entries[1].wallet_address)}
                        </span>
                        <span className="text-sm sm:text-base font-black text-white">{entries[1].total_score.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-500">pts</span>
                      </div>
                    )}

                    {/* 1st Place */}
                    {entries.length >= 1 && (
                      <div className="flex flex-col items-center w-[34%] max-w-[140px] -mt-4">
                        <div className="text-yellow-400 text-lg mb-1">👑</div>
                        <div className="relative">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-amber-700/30 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(250,204,21,0.4)] animate-pulse">
                            <span className="text-3xl sm:text-4xl">🥇</span>
                          </div>
                          <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black text-xs font-black shadow-lg">1</div>
                        </div>
                        <span className="text-xs sm:text-sm text-yellow-300 mt-2 truncate w-full text-center font-bold">
                          {maskWallet(entries[0].wallet_address)}
                        </span>
                        <span className="text-lg sm:text-xl font-black text-white">{entries[0].total_score.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-500">pts</span>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {entries.length >= 3 && (
                      <div className="flex flex-col items-center w-[30%] max-w-[120px]">
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-orange-500 bg-gradient-to-br from-orange-600/20 to-orange-900/30 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                            <span className="text-2xl sm:text-3xl">🥉</span>
                          </div>
                          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black shadow-lg">3</div>
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-300 mt-2 truncate w-full text-center font-medium">
                          {maskWallet(entries[2].wallet_address)}
                        </span>
                        <span className="text-sm sm:text-base font-black text-white">{entries[2].total_score.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-500">pts</span>
                      </div>
                    )}
                  </div>

                  {/* === TABLE HEADER === */}
                  <div className="grid grid-cols-12 gap-1 text-[10px] text-gray-500 uppercase px-3 py-2 border-y border-neon-cyan/10 font-mono">
                    <span className="col-span-1">Rank</span>
                    <span className="col-span-3">Player</span>
                    <span className="col-span-2 text-center">Points</span>
                    <span className="col-span-2 text-center">Match</span>
                    <span className="col-span-2 text-center">Trivia</span>
                    <span className="col-span-2 text-center">Seq</span>
                  </div>

                  {/* === PLAYER ROWS === */}
                  <ScrollArea className="h-[220px]">
                    <div className="space-y-1">
                      {entries.slice(3, 15).map((entry) => {
                        const isYou = walletAddress && entry.wallet_address === walletAddress;
                        return (
                          <div
                            key={entry.wallet_address}
                            className={cn(
                              "grid grid-cols-12 gap-1 items-center px-3 py-2 rounded-lg transition-all hover:bg-white/5",
                              isYou ? "bg-neon-cyan/10 ring-1 ring-neon-cyan/40" : "bg-black/20"
                            )}
                          >
                            <span className={cn("col-span-1 font-black text-sm",
                              entry.rank <= 5 ? "text-neon-pink" : "text-gray-500"
                            )}>
                              #{entry.rank}
                            </span>
                            <span className="col-span-3 text-xs text-gray-300 truncate font-medium">
                              {maskWallet(entry.wallet_address)}
                              {isYou && <span className="ml-1 text-neon-cyan text-[10px] font-bold">(You)</span>}
                            </span>
                            <span className="col-span-2 text-center text-xs text-white font-black">
                              {entry.total_score.toLocaleString()}
                            </span>
                            <span className="col-span-2 text-center text-xs text-neon-pink font-medium">
                              {entry.match_best_score > 0 ? entry.match_best_score.toLocaleString() : '-'}
                            </span>
                            <span className="col-span-2 text-center text-xs text-neon-cyan font-medium">
                              {entry.trivia_best_score > 0 ? entry.trivia_best_score.toLocaleString() : '-'}
                            </span>
                            <span className="col-span-2 text-center text-xs text-purple-400 font-medium">
                              {entry.sequence_best_score > 0 ? entry.sequence_best_score.toLocaleString() : '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* === YOUR RANK (sticky footer) === */}
                  {walletAddress && entries.find(e => e.wallet_address === walletAddress) && (() => {
                    const you = entries.find(e => e.wallet_address === walletAddress)!;
                    return (
                      <div className="grid grid-cols-12 gap-1 items-center px-3 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan/15 to-neon-pink/15 border border-neon-cyan/30 mt-1">
                        <span className="col-span-1 font-black text-sm text-neon-cyan">#{you.rank}</span>
                        <span className="col-span-3 text-xs text-neon-cyan font-bold truncate">
                          {maskWallet(you.wallet_address)} (You)
                        </span>
                        <span className="col-span-2 text-center text-xs text-white font-black">{you.total_score.toLocaleString()}</span>
                        <span className="col-span-2 text-center text-xs text-neon-pink">{you.match_best_score > 0 ? you.match_best_score.toLocaleString() : '-'}</span>
                        <span className="col-span-2 text-center text-xs text-neon-cyan">{you.trivia_best_score > 0 ? you.trivia_best_score.toLocaleString() : '-'}</span>
                        <span className="col-span-2 text-center text-xs text-purple-400">{you.sequence_best_score > 0 ? you.sequence_best_score.toLocaleString() : '-'}</span>
                      </div>
                    );
                  })()}
                </>
              )}


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
                <Button size="sm" variant="outline" className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black text-xs" onClick={() => navigate('/games/cyber-breaker')}>
                  💥 Cyber Breaker
                </Button>
                <Button size="sm" variant="outline" className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black text-xs" onClick={() => navigate('/cyber-galaxy')}>
                  🌌 Cyber Galaxy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
