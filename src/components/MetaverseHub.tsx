
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarCreator } from './avatar/AvatarCreator';
import { AvatarGallery } from './avatar/AvatarGallery';
import { MetaverseStats } from './avatar/MetaverseStats';
import { useMultiWallet } from '@/hooks/useMultiWallet';

export const MetaverseHub = () => {
  const { isWalletConnected, primaryWallet } = useMultiWallet();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
            🌐 CYBER CITY METAVERSE
            <Badge className="bg-neon-purple text-white">SOLANA POWERED</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            Create your unique avatar NFT and explore the Cyber City Metaverse
          </p>
          
          {/* Wallet Status */}
          <div className="flex justify-center mb-4">
            {isWalletConnected ? (
              <Badge className="bg-neon-green text-black">
                🟢 {primaryWallet?.type.toUpperCase()} CONNECTED
              </Badge>
            ) : (
              <Badge variant="outline" className="border-neon-pink text-neon-pink">
                ⚠️ WALLET NOT CONNECTED
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3 cyber-button-group">
          <TabsTrigger value="create" className="cyber-button-tab">
            🎨 CREATE AVATAR
          </TabsTrigger>
          <TabsTrigger value="gallery" className="cyber-button-tab">
            🖼️ MY AVATARS
          </TabsTrigger>
          <TabsTrigger value="stats" className="cyber-button-tab">
            📊 METAVERSE STATS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <AvatarCreator />
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <AvatarGallery />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <MetaverseStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};
