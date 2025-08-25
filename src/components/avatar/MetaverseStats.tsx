
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const metaverseData = {
  totalAvatars: 15420,
  maxSupply: 100000,
  uniqueOwners: 8965,
  totalVolume: 12847,
  floorPrice: 0.5,
  avgPrice: 1.2,
  popularTraits: [
    { trait: "Cyber Suit", count: 2341, percentage: 15.2 },
    { trait: "Neon Grid Background", count: 1876, percentage: 12.2 },
    { trait: "Mohawk Hair", count: 1654, percentage: 10.7 },
    { trait: "Blue Eyes", count: 1432, percentage: 9.3 },
    { trait: "Holographic Background", count: 1289, percentage: 8.4 }
  ]
};

export const MetaverseStats = () => {
  const supplyPercentage = (metaverseData.totalAvatars / metaverseData.maxSupply) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="holographic">
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-neon-green">
              {metaverseData.totalAvatars.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Total Avatars</p>
          </CardContent>
        </Card>
        
        <Card className="holographic">
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-neon-cyan">
              {metaverseData.uniqueOwners.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Unique Owners</p>
          </CardContent>
        </Card>
        
        <Card className="holographic">
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-neon-purple">
              {metaverseData.floorPrice} SOL
            </h3>
            <p className="text-sm text-muted-foreground">Floor Price</p>
          </CardContent>
        </Card>
        
        <Card className="holographic">
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-neon-pink">
              {metaverseData.totalVolume.toLocaleString()} SOL
            </h3>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Supply Progress */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-xl text-neon-cyan font-display">
            📊 Collection Supply
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Minted Supply</span>
            <Badge className="bg-neon-green text-black">
              {metaverseData.totalAvatars.toLocaleString()} / {metaverseData.maxSupply.toLocaleString()}
            </Badge>
          </div>
          <Progress value={supplyPercentage} className="h-3" />
          <p className="text-center text-sm text-muted-foreground">
            {supplyPercentage.toFixed(1)}% of total supply minted
          </p>
        </CardContent>
      </Card>

      {/* Popular Traits */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-xl text-neon-purple font-display">
            🎨 Popular Traits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metaverseData.popularTraits.map((trait, index) => (
            <div key={trait.trait} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neon-cyan">
                  #{index + 1} {trait.trait}
                </span>
                <Badge variant="outline" className="text-xs">
                  {trait.count} ({trait.percentage}%)
                </Badge>
              </div>
              <Progress value={trait.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-xl text-neon-pink font-display">
            ⚡ Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Minted", avatar: "Digital Samurai #15420", user: "CyberK...x7z9", time: "2 min ago", price: "500 CCTR" },
              { action: "Sold", avatar: "Neon Punk #15419", user: "Gamer...a3b1", time: "5 min ago", price: "1.2 SOL" },
              { action: "Minted", avatar: "Cyber Knight #15418", user: "Player...9f2c", time: "8 min ago", price: "500 CCTR" },
              { action: "Transferred", avatar: "Holo Warrior #15417", user: "Master...4d8e", time: "12 min ago", price: "-" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded border border-gray-800 hover:border-neon-cyan/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <Badge 
                    className={`text-xs ${
                      activity.action === 'Minted' ? 'bg-neon-green text-black' :
                      activity.action === 'Sold' ? 'bg-neon-cyan text-black' :
                      'bg-neon-purple text-white'
                    }`}
                  >
                    {activity.action}
                  </Badge>
                  <div>
                    <p className="font-semibold text-sm">{activity.avatar}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-neon-cyan">{activity.price}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
