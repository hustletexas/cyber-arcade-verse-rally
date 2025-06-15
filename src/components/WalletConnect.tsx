
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Plus, Copy, Eye, EyeOff } from 'lucide-react';

export const WalletConnect = () => {
  const { toast } = useToast();
  const [createdWallet, setCreatedWallet] = useState<{
    publicKey: string;
    privateKey: string;
  } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createSolanaWallet = async () => {
    setIsCreating(true);
    try {
      // Generate a new Solana keypair
      const { Keypair } = await import('@solana/web3.js');
      const newKeypair = Keypair.generate();
      const publicKey = newKeypair.publicKey.toString();
      const privateKey = Buffer.from(newKeypair.secretKey).toString('hex');
      
      // Store wallet info (in production, this should be more secure)
      const walletData = { publicKey, privateKey };
      localStorage.setItem('cyberCityWallet', JSON.stringify(walletData));
      
      setCreatedWallet(walletData);
      
      toast({
        title: "Solana Wallet Created! 🎉",
        description: `New wallet: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
      });
      
      // Show security warning
      setTimeout(() => {
        toast({
          title: "⚠️ Security Notice",
          description: "Keep your private key safe! This wallet is for demo purposes.",
        });
      }, 2000);
      
    } catch (error) {
      console.error('Wallet creation error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create Solana wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const connectPhantom = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        toast({
          title: "Phantom Connected!",
          description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
        });
      } else {
        toast({
          title: "Phantom Not Found",
          description: "Please install Phantom wallet extension",
          variant: "destructive",
        });
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Phantom connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
          👛 SOLANA WALLET
          <Badge className="bg-neon-green text-black">BLOCKCHAIN READY</Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          Create a new Solana wallet or connect your existing one
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Creation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="vending-machine p-6">
            <div className="text-center space-y-4">
              <h3 className="font-display text-xl text-neon-cyan">Create New Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Generate a brand new Solana wallet instantly
              </p>
              <Button 
                onClick={createSolanaWallet}
                disabled={isCreating}
                className="cyber-button w-full flex items-center gap-2"
              >
                <Plus size={20} />
                {isCreating ? 'CREATING...' : 'CREATE WALLET'}
              </Button>
            </div>
          </Card>

          <Card className="vending-machine p-6">
            <div className="text-center space-y-4">
              <h3 className="font-display text-xl text-neon-cyan">Connect Phantom</h3>
              <p className="text-sm text-muted-foreground">
                Connect your existing Phantom wallet
              </p>
              <Button 
                onClick={connectPhantom}
                className="cyber-button w-full flex items-center gap-2"
              >
                <Wallet size={20} />
                CONNECT PHANTOM
              </Button>
            </div>
          </Card>
        </div>

        {/* Created Wallet Display */}
        {createdWallet && (
          <Card className="holographic border-neon-green">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-neon-green">Your New Wallet</h3>
                <Badge className="bg-neon-green text-black">ACTIVE</Badge>
              </div>
              
              {/* Public Key */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-neon-cyan">Public Address:</label>
                <div className="flex items-center gap-2 p-3 bg-black/50 rounded border border-neon-cyan/30">
                  <code className="text-sm text-neon-green flex-1 break-all">
                    {createdWallet.publicKey}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(createdWallet.publicKey, 'Public key')}
                    className="shrink-0"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              {/* Private Key */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-neon-pink">Private Key (Keep Secret!):</label>
                <div className="flex items-center gap-2 p-3 bg-red-900/20 rounded border border-red-500/30">
                  <code className="text-sm text-red-400 flex-1 break-all">
                    {showPrivateKey ? createdWallet.privateKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="shrink-0"
                  >
                    {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  {showPrivateKey && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(createdWallet.privateKey, 'Private key')}
                      className="shrink-0"
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-red-400">
                  ⚠️ Never share your private key! This is for demo purposes only.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blockchain Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="holographic p-4">
            <h4 className="text-neon-green font-bold">NETWORK</h4>
            <p className="text-sm">Solana Mainnet</p>
          </div>
          <div className="holographic p-4">
            <h4 className="text-neon-cyan font-bold">TOKEN</h4>
            <p className="text-sm">SOL & $CCTR</p>
          </div>
          <div className="holographic p-4">
            <h4 className="text-neon-pink font-bold">FEES</h4>
            <p className="text-sm">Ultra Low</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
