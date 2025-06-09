
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TopBar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userType, setUserType] = useState<'google' | 'wallet' | null>(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
    avatar: ''
  });

  const handleGoogleLogin = () => {
    // Placeholder for Google login via Thirdweb Auth
    setIsConnected(true);
    setUserType('google');
    setUserInfo({
      name: 'Player One',
      address: 'player.one@gmail.com',
      avatar: ''
    });
    console.log('Google login initiated');
  };

  const handleWalletConnect = (walletType: 'phantom' | 'metamask' | 'walletconnect') => {
    // Placeholder for wallet connection
    setIsConnected(true);
    setUserType('wallet');
    setUserInfo({
      name: `${walletType} User`,
      address: '7xKX...9Qmp',
      avatar: ''
    });
    console.log(`${walletType} wallet connection initiated`);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUserType(null);
    setUserInfo({ name: '', address: '', avatar: '' });
  };

  return (
    <header className="border-b border-neon-cyan/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center neon-glow">
              <span className="text-xl font-black">🕹️</span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-neon-cyan">CYBER CITY</h2>
              <p className="text-xs text-neon-purple">ARCADE</p>
            </div>
          </div>

          {/* Connection Status & User Info */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <Card className="arcade-frame px-4 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border-2 border-neon-cyan">
                    <AvatarImage src={userInfo.avatar} />
                    <AvatarFallback className="bg-neon-purple text-black font-bold">
                      {userInfo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-bold text-neon-cyan">{userInfo.name}</p>
                    <p className="text-neon-purple text-xs">{userInfo.address}</p>
                  </div>
                  <Badge className="bg-neon-green text-black">
                    {userType === 'google' ? '🔐 GOOGLE' : '🔗 WALLET'}
                  </Badge>
                  <Button 
                    onClick={handleDisconnect}
                    variant="outline" 
                    size="sm"
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                  >
                    Disconnect
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="flex items-center gap-3">
                {/* Google Login */}
                <Button 
                  onClick={handleGoogleLogin}
                  className="cyber-button flex items-center gap-2"
                >
                  <span className="text-lg">🔐</span>
                  GOOGLE LOGIN
                </Button>

                {/* Wallet Connect Options */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleWalletConnect('phantom')}
                    variant="outline"
                    className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                  >
                    👻 PHANTOM
                  </Button>
                  <Button 
                    onClick={() => handleWalletConnect('metamask')}
                    variant="outline"
                    className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                  >
                    🦊 METAMASK
                  </Button>
                  <Button 
                    onClick={() => handleWalletConnect('walletconnect')}
                    variant="outline"
                    className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                  >
                    🔗 WALLET
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
