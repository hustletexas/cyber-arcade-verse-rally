
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { AvatarPreview } from './AvatarPreview';
import { AvatarAttributes, CreateAvatarParams } from '@/types/avatar';

const AVATAR_OPTIONS = {
  skinColor: ['#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#654321'],
  hairStyle: ['Short', 'Long', 'Curly', 'Bald', 'Ponytail', 'Mohawk'],
  hairColor: ['#000000', '#8B4513', '#FFD700', '#FF4500', '#4B0082', '#00FF00'],
  eyeColor: ['#8B4513', '#0000FF', '#00FF00', '#808080', '#800080', '#FFA500'],
  clothingTop: ['T-Shirt', 'Hoodie', 'Jacket', 'Tank Top', 'Dress Shirt', 'Cyber Suit'],
  clothingBottom: ['Jeans', 'Shorts', 'Cargo Pants', 'Skirt', 'Leggings', 'Cyber Pants'],
  background: ['Cyber City', 'Neon Grid', 'Space Station', 'Digital Void', 'Matrix Code', 'Holographic']
};

export const AvatarCreator = () => {
  const { toast } = useToast();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  
  const [avatarName, setAvatarName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [attributes, setAttributes] = useState<AvatarAttributes>({
    skinColor: AVATAR_OPTIONS.skinColor[0],
    hairStyle: AVATAR_OPTIONS.hairStyle[0],
    hairColor: AVATAR_OPTIONS.hairColor[0],
    eyeColor: AVATAR_OPTIONS.eyeColor[0],
    clothingTop: AVATAR_OPTIONS.clothingTop[0],
    clothingBottom: AVATAR_OPTIONS.clothingBottom[0],
    accessories: [],
    background: AVATAR_OPTIONS.background[0]
  });

  const updateAttribute = (key: keyof AvatarAttributes, value: string) => {
    setAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const createAvatar = async () => {
    if (!isWalletConnected || !primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create an avatar",
        variant: "destructive"
      });
      return;
    }

    if (!avatarName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your avatar",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // In production, this would interact with the Solana program
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate transaction

      toast({
        title: "🎉 Avatar Created!",
        description: `${avatarName} has been minted as an NFT to your wallet!`,
      });

      // Reset form
      setAvatarName('');
      setAttributes({
        skinColor: AVATAR_OPTIONS.skinColor[0],
        hairStyle: AVATAR_OPTIONS.hairStyle[0],
        hairColor: AVATAR_OPTIONS.hairColor[0],
        eyeColor: AVATAR_OPTIONS.eyeColor[0],
        clothingTop: AVATAR_OPTIONS.clothingTop[0],
        clothingBottom: AVATAR_OPTIONS.clothingBottom[0],
        accessories: [],
        background: AVATAR_OPTIONS.background[0]
      });

    } catch (error) {
      console.error('Avatar creation error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Avatar Customization */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-xl text-neon-cyan font-display">
            🎨 Customize Your Avatar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Name */}
          <div className="space-y-2">
            <Label htmlFor="avatarName">Avatar Name</Label>
            <Input
              id="avatarName"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              placeholder="Enter avatar name..."
              maxLength={50}
            />
          </div>

          {/* Skin Color */}
          <div className="space-y-2">
            <Label>Skin Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.skinColor.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    attributes.skinColor === color ? 'border-neon-cyan' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateAttribute('skinColor', color)}
                />
              ))}
            </div>
          </div>

          {/* Hair Style & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hair Style</Label>
              <Select value={attributes.hairStyle} onValueChange={(value) => updateAttribute('hairStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_OPTIONS.hairStyle.map((style) => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hair Color</Label>
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_OPTIONS.hairColor.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      attributes.hairColor === color ? 'border-neon-cyan' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateAttribute('hairColor', color)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Eye Color */}
          <div className="space-y-2">
            <Label>Eye Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.eyeColor.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    attributes.eyeColor === color ? 'border-neon-cyan' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateAttribute('eyeColor', color)}
                />
              ))}
            </div>
          </div>

          {/* Clothing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Top</Label>
              <Select value={attributes.clothingTop} onValueChange={(value) => updateAttribute('clothingTop', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_OPTIONS.clothingTop.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bottom</Label>
              <Select value={attributes.clothingBottom} onValueChange={(value) => updateAttribute('clothingBottom', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_OPTIONS.clothingBottom.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Background */}
          <div className="space-y-2">
            <Label>Background</Label>
            <Select value={attributes.background} onValueChange={(value) => updateAttribute('background', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVATAR_OPTIONS.background.map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Creation Fee */}
          <Card className="bg-neon-cyan/10 border-neon-cyan/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neon-cyan">Creation Fee:</span>
                <Badge className="bg-neon-green text-black">500 CCTR</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <Button
            onClick={createAvatar}
            disabled={isCreating || !isWalletConnected || !avatarName.trim()}
            className="w-full cyber-button"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Avatar...
              </>
            ) : (
              '🎨 CREATE AVATAR NFT'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Avatar Preview */}
      <AvatarPreview attributes={attributes} name={avatarName} />
    </div>
  );
};
