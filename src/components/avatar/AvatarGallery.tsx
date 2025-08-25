
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';

// Mock data for demonstration
const mockAvatars = [
  {
    id: 1,
    name: "Cyber Punk",
    mint: "APt1...xyz",
    attributes: {
      skinColor: "#FDBCB4",
      hairStyle: "Mohawk",
      background: "Neon Grid"
    },
    createdAt: Date.now() - 86400000,
  },
  {
    id: 2,
    name: "Digital Warrior",
    mint: "BQu2...abc", 
    attributes: {
      skinColor: "#C68642",
      hairStyle: "Long",
      background: "Cyber City"
    },
    createdAt: Date.now() - 172800000,
  }
];

export const AvatarGallery = () => {
  const { toast } = useToast();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  if (!isWalletConnected) {
    return (
      <Card className="arcade-frame">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Connect your wallet to view your avatar collection
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collection Stats */}
      <Card className="vending-machine">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-2xl font-bold text-neon-green">{mockAvatars.length}</h3>
              <p className="text-sm text-muted-foreground">Avatars Owned</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neon-cyan">2.5 SOL</h3>
              <p className="text-sm text-muted-foreground">Collection Value</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neon-purple">85</h3>
              <p className="text-sm text-muted-foreground">Rarity Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAvatars.map((avatar) => (
          <Card key={avatar.id} className="arcade-frame cursor-pointer hover:border-neon-cyan/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg text-neon-cyan font-display flex items-center justify-between">
                {avatar.name}
                <Badge className="text-xs">#{avatar.id}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Preview */}
              <div className="aspect-square bg-gradient-to-b from-neon-cyan/20 to-neon-purple/20 rounded-lg border border-neon-cyan/30 p-4">
                <div className="relative h-full flex flex-col items-center justify-center">
                  <div 
                    className="w-16 h-16 rounded-full border-4 border-neon-cyan/50 mb-4"
                    style={{ backgroundColor: avatar.attributes.skinColor }}
                  />
                  <Badge className="bg-neon-green text-black text-xs">
                    {avatar.attributes.hairStyle}
                  </Badge>
                </div>
              </div>

              {/* Avatar Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mint:</span>
                  <span className="text-neon-cyan">{avatar.mint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Background:</span>
                  <span>{avatar.attributes.background}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(avatar.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAvatar(avatar.id)}
                >
                  📝 Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Transfer Avatar",
                      description: "Avatar transfer functionality coming soon!",
                    });
                  }}
                >
                  🔄 Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Avatar Card */}
        <Card className="arcade-frame border-dashed border-neon-green/50 cursor-pointer hover:border-neon-green transition-colors">
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <div className="text-4xl">➕</div>
              <h3 className="font-display text-lg text-neon-green">Create New Avatar</h3>
              <p className="text-sm text-muted-foreground">
                Mint a new avatar NFT for 500 CCTR
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
