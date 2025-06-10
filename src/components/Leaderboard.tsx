
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  placement: number;
  created_at: string;
  profiles: {
    username: string;
    email: string;
    avatar_url: string;
  };
}

interface LeaderboardProps {
  tournamentId?: string;
  gameType?: 'tetris' | 'pacman' | 'galaga';
  limit?: number;
}

export const Leaderboard = ({ tournamentId, gameType, limit = 10 }: LeaderboardProps) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [tournamentId, gameType]);

  const fetchLeaderboard = async () => {
    try {
      let query = supabase
        .from('tournament_participants')
        .select(`
          user_id,
          placement,
          created_at,
          profiles!inner(username, email, avatar_url)
        `)
        .order('placement', { ascending: false })
        .limit(limit);

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getGameIcon = (type?: string) => {
    switch (type) {
      case 'tetris': return '🧩';
      case 'pacman': return '👻';
      case 'galaga': return '🚀';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <Card className="arcade-frame">
        <CardContent className="p-6">
          <div className="text-center text-neon-cyan">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          {getGameIcon(gameType)} LEADERBOARD
          <Badge className="bg-neon-green text-black">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No scores recorded yet. Be the first to play!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-neon-cyan/30">
                <TableHead className="text-neon-purple">Rank</TableHead>
                <TableHead className="text-neon-purple">Player</TableHead>
                <TableHead className="text-neon-purple">Score</TableHead>
                <TableHead className="text-neon-purple">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow 
                  key={entry.user_id} 
                  className={`border-neon-cyan/20 hover:bg-neon-cyan/5 ${
                    entry.user_id === user?.id ? 'bg-neon-purple/10' : ''
                  }`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getRankEmoji(index + 1)}</span>
                      <span className="font-mono text-neon-cyan">
                        {index + 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-neon-cyan">
                        <AvatarImage src={entry.profiles.avatar_url} />
                        <AvatarFallback className="bg-neon-purple text-black text-xs">
                          {entry.profiles.username?.charAt(0) || entry.profiles.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-neon-cyan">
                          {entry.profiles.username || entry.profiles.email?.split('@')[0]}
                        </div>
                        {entry.user_id === user?.id && (
                          <Badge className="bg-neon-pink text-black text-xs">YOU</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xl text-neon-green font-bold">
                      {entry.placement.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
