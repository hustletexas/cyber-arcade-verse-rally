
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { connectPhantom, connectMetaMask, connectWalletConnect, disconnectWallet } from '@/utils/walletUtils';

export const TopBar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletType, setWalletType] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check for existing wallet connection
    const savedAddress = localStorage.getItem('walletAddress');
    const savedType = localStorage.getItem('walletType');
    if (savedAddress && savedType) {
      setWalletAddress(savedAddress);
      setWalletType(savedType);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      await disconnectWallet();
      setWalletAddress('');
      setWalletType('');
      toast({
        title: "Goodbye!",
        description: "Successfully logged out from Cyber City Arcade",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleWalletConnect = async (walletName: 'phantom' | 'metamask' | 'walletconnect') => {
    setIsConnecting(true);
    
    try {
      let result;
      
      switch (walletName) {
        case 'phantom':
          result = await connectPhantom();
          break;
        case 'metamask':
          result = await connectMetaMask();
          break;
        case 'walletconnect':
          result = await connectWalletConnect();
          break;
        default:
          throw new Error('Unknown wallet type');
      }

      if (result.success && result.address) {
        setWalletAddress(result.address);
        setWalletType(walletName);
        localStorage.setItem('walletAddress', result.address);
        localStorage.setItem('walletType', walletName);
        
        toast({
          title: `${walletName.toUpperCase()} Connected!`,
          description: `Connected: ${result.address.slice(0, 8)}...${result.address.slice(-8)}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect wallet",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnectWallet();
    setWalletAddress('');
    setWalletType('');
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <header className="border-b border-neon-cyan/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden neon-glow">
              <img 
                src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                alt="Cyber City Arcade Logo" 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Connection Status & User Info */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="text-neon-cyan">Loading...</div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Wallet Connection Section */}
                <div className="flex gap-2">
                  {walletAddress ? (
                    <Card className="arcade-frame px-4 py-2">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-neon-green text-black">
                          🔗 {walletType.toUpperCase()}
                        </Badge>
                        <div className="text-sm">
                          <p className="font-bold text-neon-cyan">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </p>
                        </div>
                        <Button 
                          onClick={handleDisconnectWallet}
                          variant="outline" 
                          size="sm"
                          className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <>
                      <Button 
                        onClick={() => handleWalletConnect('phantom')}
                        disabled={isConnecting}
                        variant="outline"
                        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black cyber-button"
                      >
                        👻 PHANTOM
                      </Button>
                      <Button 
                        onClick={() => handleWalletConnect('metamask')}
                        disabled={isConnecting}
                        variant="outline"
                        className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black cyber-button"
                      >
                        🦊 METAMASK
                      </Button>
                      <Button 
                        onClick={() => handleWalletConnect('walletconnect')}
                        disabled={isConnecting}
                        variant="outline"
                        className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black cyber-button"
                      >
                        🔗 WALLET
                      </Button>
                    </>
                  )}
                </div>

                {/* User Authentication Section */}
                {user ? (
                  <Card className="arcade-frame px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border-2 border-neon-cyan">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-neon-purple text-black font-bold">
                          {user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-bold text-neon-cyan">
                          {user.user_metadata?.username || user.email?.split('@')[0]}
                        </p>
                        <p className="text-neon-purple text-xs">{user.email}</p>
                      </div>
                      <Badge className="bg-neon-green text-black">
                        🔐 AUTHENTICATED
                      </Badge>
                      <Button 
                        onClick={handleSignOut}
                        variant="outline" 
                        size="sm"
                        className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                      >
                        Logout
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="cyber-button flex items-center gap-2"
                  >
                    <span className="text-lg">🔐</span>
                    LOGIN / SIGNUP
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
