
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const RaffleSection = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected, getWalletIcon } = useMultiWallet();
  const { toast } = useToast();
  const [processingTicket, setProcessingTicket] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'cctr' | 'sol' | 'usdc'>('cctr');

  const handlePlayNow = async () => {
    if (!user && !isWalletConnected) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet or log in to participate in raffles",
        variant: "destructive",
      });
      return;
    }

    setProcessingTicket(true);
    
    try {
      if (selectedPayment === 'cctr') {
        await processCCTRPayment();
      } else {
        await processSolanaPayment(0.1, selectedPayment);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setProcessingTicket(false);
    }
  };

  const processCCTRPayment = async () => {
    // Mock CCTR payment
    toast({
      title: "🎫 Raffle Ticket Purchased!",
      description: "Used 100 CCTR tokens • Good luck in the draw!",
    });
  };

  const processSolanaPayment = async (amount: number, paymentMethod: 'sol' | 'usdc') => {
    try {
      const wallet = window.solana;
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      // Connect wallet to get publicKey if not already connected
      let publicKey;
      if (wallet.isConnected) {
        // If already connected, we need to get the publicKey from our stored wallet info
        if (!primaryWallet?.address) {
          throw new Error('No wallet address available');
        }
        publicKey = new PublicKey(primaryWallet.address);
      } else {
        const response = await wallet.connect();
        if (!response?.publicKey) {
          throw new Error('Failed to get wallet public key');
        }
        publicKey = new PublicKey(response.publicKey.toString());
      }

      // Create transaction
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const transaction = new Transaction();

      if (paymentMethod === 'sol') {
        const lamports = amount * LAMPORTS_PER_SOL;
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey('11111111111111111111111111111112'), // System program
            lamports: Math.floor(lamports),
          })
        );
      }
      // USDC logic would go here

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      toast({
        title: "🎫 Raffle Ticket Purchased!",
        description: `Paid ${amount} ${paymentMethod.toUpperCase()} • TX: ${signature.slice(0, 8)}...`,
      });

    } catch (error: any) {
      throw new Error(error.message || 'Solana payment failed');
    }
  };

  const isAuthenticated = user || isWalletConnected;

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          🎰 MEGA RAFFLE
          <Badge className="bg-neon-pink text-black animate-pulse">LIVE NOW</Badge>
        </CardTitle>
        {primaryWallet && (
          <div className="text-center">
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
              🔗 Wallet: {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
            </Badge>
          </div>
        )}
        <p className="text-muted-foreground">
          Win amazing prizes! Gaming PC RTX 4090, PlayStation 5, and more!
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prize Display */}
          <div className="space-y-4">
            <h3 className="font-display text-xl text-neon-purple">🏆 Current Prizes</h3>
            <div className="space-y-3">
              <Card className="vending-machine p-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="/lovable-uploads/3fc5f3c0-2b28-4cff-acdc-7c3896ee635b.png" 
                    alt="Gaming PC" 
                    className="w-16 h-16 object-cover rounded" 
                  />
                  <div>
                    <h4 className="font-bold text-neon-cyan">Gaming PC RTX 4090</h4>
                    <p className="text-sm text-muted-foreground">Value: $3,500</p>
                  </div>
                </div>
              </Card>
              <Card className="vending-machine p-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="/lovable-uploads/8820a165-f5a8-4d8a-b9d4-8dca31666e27.png" 
                    alt="PlayStation 5" 
                    className="w-16 h-16 object-cover rounded" 
                  />
                  <div>
                    <h4 className="font-bold text-neon-cyan">PlayStation 5</h4>
                    <p className="text-sm text-muted-foreground">Value: $500</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Entry Section */}
          <div className="space-y-4">
            <h3 className="font-display text-xl text-neon-green">🎫 Get Your Ticket</h3>
            
            {isAuthenticated ? (
              <>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={selectedPayment === 'cctr' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPayment('cctr')}
                      className="cyber-button"
                    >
                      💎 100 CCTR
                    </Button>
                    <Button
                      variant={selectedPayment === 'sol' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPayment('sol')}
                      className="cyber-button"
                    >
                      ◎ 0.1 SOL
                    </Button>
                    <Button
                      variant={selectedPayment === 'usdc' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPayment('usdc')}
                      className="cyber-button"
                    >
                      💵 $5 USDC
                    </Button>
                  </div>

                  <Button 
                    onClick={handlePlayNow}
                    disabled={processingTicket}
                    className="cyber-button w-full"
                    size="lg"
                  >
                    {processingTicket ? "⏳ PROCESSING..." : "🎮 PLAY NOW"}
                  </Button>
                </div>

                <Card className="holographic p-4">
                  <div className="text-center">
                    <h4 className="font-bold text-neon-purple mb-2">🎯 Your Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neon-cyan">Tickets: 3</p>
                        <p className="text-neon-green">Wins: 0</p>
                      </div>
                      <div>
                        <p className="text-neon-pink">Spent: 300 CCTR</p>
                        <p className="text-neon-purple">Odds: 1:156</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="arcade-frame border-neon-pink/30">
                <CardContent className="text-center py-8">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-xl font-bold text-neon-pink mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to participate in raffles and win amazing prizes
                  </p>
                  <Button className="cyber-button" disabled>
                    🚀 Connect Wallet to Play
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Raffle Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="holographic p-4 text-center">
            <div className="text-2xl mb-2">🎫</div>
            <div className="text-xl font-bold text-neon-cyan">456</div>
            <p className="text-xs text-muted-foreground">Tickets Sold</p>
          </Card>
          <Card className="holographic p-4 text-center">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-xl font-bold text-neon-purple">2d 14h</div>
            <p className="text-xs text-muted-foreground">Time Left</p>
          </Card>
          <Card className="holographic p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-xl font-bold text-neon-green">$4,250</div>
            <p className="text-xs text-muted-foreground">Prize Pool</p>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
