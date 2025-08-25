
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarAttributes } from '@/types/avatar';

interface AvatarPreviewProps {
  attributes: AvatarAttributes;
  name: string;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ attributes, name }) => {
  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="text-xl text-neon-purple font-display">
          👁️ Avatar Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Display */}
        <div className="relative aspect-square bg-gradient-to-b from-neon-cyan/20 to-neon-purple/20 rounded-lg border border-neon-cyan/30 p-8">
          <div className="absolute inset-0 bg-grid opacity-20 rounded-lg"></div>
          
          {/* Simple Avatar Representation */}
          <div className="relative h-full flex flex-col items-center justify-center space-y-4">
            {/* Head */}
            <div 
              className="w-20 h-20 rounded-full border-4 border-neon-cyan/50"
              style={{ backgroundColor: attributes.skinColor }}
            >
              {/* Eyes */}
              <div className="flex justify-center items-center h-full space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: attributes.eyeColor }}
                />
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: attributes.eyeColor }}
                />
              </div>
            </div>
            
            {/* Hair */}
            <div className="absolute top-2 text-xs text-center">
              <Badge 
                className="text-xs"
                style={{ backgroundColor: attributes.hairColor, color: '#000' }}
              >
                {attributes.hairStyle}
              </Badge>
            </div>
            
            {/* Body */}
            <div className="space-y-2 text-center">
              <Badge className="bg-neon-green text-black text-xs">
                {attributes.clothingTop}
              </Badge>
              <br />
              <Badge className="bg-neon-purple text-white text-xs">
                {attributes.clothingBottom}
              </Badge>
            </div>
          </div>
        </div>

        {/* Avatar Info */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="font-display text-lg text-neon-cyan">
              {name || 'Unnamed Avatar'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Background: {attributes.background}
            </p>
          </div>

          {/* Attributes Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="holographic p-2 rounded">
              <span className="text-neon-green font-bold">SKIN:</span>
              <br />
              <span className="opacity-80">Custom Color</span>
            </div>
            <div className="holographic p-2 rounded">
              <span className="text-neon-cyan font-bold">HAIR:</span>
              <br />
              <span className="opacity-80">{attributes.hairStyle}</span>
            </div>
            <div className="holographic p-2 rounded">
              <span className="text-neon-pink font-bold">EYES:</span>
              <br />
              <span className="opacity-80">Custom Color</span>
            </div>
            <div className="holographic p-2 rounded">
              <span className="text-neon-purple font-bold">OUTFIT:</span>
              <br />
              <span className="opacity-80">{attributes.clothingTop}</span>
            </div>
          </div>

          {/* NFT Info */}
          <Card className="bg-neon-cyan/10 border-neon-cyan/30">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-neon-cyan font-semibold">
                🏷️ This will be minted as a unique NFT on Solana
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
