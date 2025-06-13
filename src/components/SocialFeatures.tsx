
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const SocialFeatures = () => {
  const { toast } = useToast();

  const handleWatch = () => {
    window.open('https://youtube.com/cybercityarcade', '_blank');
    toast({
      title: "Opening Stream",
      description: "Watch live tournaments on YouTube!",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Cyber City Arcade',
        text: 'Check out this amazing Web3 gaming platform!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Share Cyber City Arcade with friends",
      });
    }
  };

  const handleDiscord = () => {
    window.open('https://discord.gg/cybercityarcade', '_blank');
  };

  const handleX = () => {
    window.open('https://x.com/cybercityarcade', '_blank');
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
          📱 SOCIAL & STREAMING
          <Badge className="bg-neon-pink text-black animate-pulse">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={handleWatch} className="cyber-button flex flex-col gap-2 h-20">
            <span className="text-2xl">📺</span>
            <span className="text-sm">WATCH</span>
          </Button>
          
          <Button onClick={handleShare} className="cyber-button flex flex-col gap-2 h-20">
            <span className="text-2xl">📤</span>
            <span className="text-sm">SHARE</span>
          </Button>
          
          <Button onClick={handleDiscord} className="cyber-button flex flex-col gap-2 h-20">
            <span className="text-2xl">💬</span>
            <span className="text-sm">DISCORD</span>
          </Button>
          
          <Button onClick={handleX} className="cyber-button flex flex-col gap-2 h-20">
            <span className="text-2xl">𝕏</span>
            <span className="text-sm">X.COM</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
