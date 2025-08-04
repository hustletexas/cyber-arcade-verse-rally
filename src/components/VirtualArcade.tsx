
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameLibrary } from './arcade/GameLibrary';
import { ArcadeLeaderboards } from './arcade/ArcadeLeaderboards';
import { ArcadeTournaments } from './arcade/ArcadeTournaments';
import { ArcadeStore } from './arcade/ArcadeStore';
import { PlayerArcadeStats } from './arcade/PlayerArcadeStats';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';

export const VirtualArcade = () => {
  const { user } = useAuth();
  const { isWalletConnected, getConnectedWallet } = useWallet();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState({
    totalGamesPlayed: 0,
    totalScore: 0,
    currentLevel: 1,
    tokensEarned: 0,
    achievements: []
  });

  const connectedWallet = getConnectedWallet();

  return (
    <div className="space-y-6">
      {/* Arcade Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="text-center space-y-4">
            <CardTitle className="font-display text-4xl text-neon-cyan">
              🕹️ VIRTUAL ARCADE
            </CardTitle>
            <p className="text-lg text-neon-purple">
              Classic & Modern Games • High Score Challenges • CCTR Rewards
            </p>
            {connectedWallet && (
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                🔗 Wallet Connected: {connectedWallet.address.slice(0, 8)}...
              </Badge>
            )}
            
            {/* Floating Arcade Icons */}
            <div className="relative">
              <div className="absolute -top-10 left-1/4 text-2xl animate-float opacity-60">🎮</div>
              <div className="absolute -top-8 right-1/3 text-xl animate-pulse opacity-50">👾</div>
              <div className="absolute -top-12 right-1/4 text-lg animate-bounce opacity-40">🏆</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Player Stats Overview */}
      {(user || isWalletConnected()) && (
        <PlayerArcadeStats stats={playerStats} />
      )}

      {/* Main Arcade Interface */}
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-neon-cyan/30">
          <TabsTrigger value="games" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
            🎮 Games
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="data-[state=active]:bg-neon-purple data-[state=active]:text-white">
            🏆 Leaderboards
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="data-[state=active]:bg-neon-pink data-[state=active]:text-black">
            🎯 Tournaments
          </TabsTrigger>
          <TabsTrigger value="store" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
            🛒 Arcade Store
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="mt-6">
          <GameLibrary onGameSelect={setSelectedGame} />
        </TabsContent>

        <TabsContent value="leaderboards" className="mt-6">
          <ArcadeLeaderboards />
        </TabsContent>

        <TabsContent value="tournaments" className="mt-6">
          <ArcadeTournaments />
        </TabsContent>

        <TabsContent value="store" className="mt-6">
          <ArcadeStore />
        </TabsContent>
      </Tabs>

      {/* Authentication Prompt */}
      {!user && !isWalletConnected() && (
        <Card className="arcade-frame border-neon-pink/30">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-neon-pink mb-2">Connect to Play</h3>
            <p className="text-muted-foreground mb-4">
              Connect your wallet or sign in to play games, compete on leaderboards, and earn CCTR tokens!
            </p>
            <Button className="cyber-button">
              🚀 Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
