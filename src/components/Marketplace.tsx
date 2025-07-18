import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';

const mockNFTs = [
  // Legendary NFTs
  {
    id: 1,
    name: "Retro Future Ride",
    price: { cctr: 3500, sol: 1.75, usdc: 157, pyusd: 157 },
    image: "/lovable-uploads/1131ab8a-f1c5-43a1-bc8a-bbbe7f2f9fd1.png",
    rarity: "Legendary",
    seller: "CyberMotors",
    description: "Ultra-rare cyberpunk DeLorean in neon cityscape - the ultimate collector's ride"
  },
  {
    id: 2,
    name: "Cyber City Console",
    price: { cctr: 4200, sol: 2.1, usdc: 189, pyusd: 189 },
    image: "/lovable-uploads/adc51b6f-7d82-44cc-86b5-e984bc74d2d3.png",
    rarity: "Legendary",
    seller: "ArcadeMaster",
    description: "Ultimate cyberpunk arcade console with holographic city display - grants access to all premium games"
  },
  {
    id: 3,
    name: "Cyber City Arcade",
    price: { cctr: 5000, sol: 2.5, usdc: 225, pyusd: 225 },
    image: "/lovable-uploads/25b4f405-8edd-4c52-9b77-0d270d1b6c90.png",
    rarity: "Legendary",
    seller: "RetroMaster",
    description: "Iconic Cyber City arcade building with neon signage - the heart of the digital gaming universe"
  },
  // Epic NFTs
  {
    id: 4,
    name: "Solana Arcade Champion",
    price: { cctr: 2800, sol: 1.4, usdc: 126, pyusd: 126 },
    image: "/lovable-uploads/ad465959-8a2b-40c4-bb3d-512e3b2246dc.png",
    rarity: "Epic",
    seller: "SolanaGaming",
    description: "Elite cyberpunk gamer with VR headset exploring the neon-lit Solana blockchain arcade district"
  },
  {
    id: 5,
    name: "Neon Arcade Portal",
    price: { cctr: 3200, sol: 1.6, usdc: 144, pyusd: 144 },
    image: "/lovable-uploads/f7fdd876-ef2a-4140-9a9e-961af057b14c.png",
    rarity: "Epic",
    seller: "PortalMaster",
    description: "Mystical arcade portal gateway to the digital realm - witness the birth of virtual reality gaming"
  },
  {
    id: 6,
    name: "Cyber City Genesis #001",
    price: { cctr: 4000, sol: 2.0, usdc: 180, pyusd: 180 },
    image: "/lovable-uploads/e0346804-3303-4132-accf-7a80c53b7b8c.png",
    rarity: "Epic",
    seller: "GenesisCollection",
    description: "Genesis edition arcade cabinet from the original Cyber City collection - limited first edition piece"
  },
  // Rare NFTs
  {
    id: 7,
    name: "Cyber City Mobile Gamer",
    price: { cctr: 1800, sol: 0.9, usdc: 81, pyusd: 81 },
    image: "/lovable-uploads/fc54726a-fe30-47a9-8b16-766dc230e78c.png",
    rarity: "Rare",
    seller: "MobileGamingCorp",
    description: "Cyberpunk mobile gamer with alien tech device - the future of portable gaming in neon cityscapes"
  },
  {
    id: 8,
    name: "VR Racing Champion",
    price: { cctr: 2200, sol: 1.1, usdc: 99, pyusd: 99 },
    image: "/lovable-uploads/7aefc14a-b1ec-4889-8990-4f12e95eec7d.png",
    rarity: "Rare",
    seller: "VRRacingLeague",
    description: "Professional VR racing simulator setup with cyberpunk aesthetic - experience the ultimate driving simulation"
  },
  {
    id: 9,
    name: "Tetris Master Pro",
    price: { cctr: 2000, sol: 1.0, usdc: 90, pyusd: 90 },
    image: "/lovable-uploads/2eea59c4-10d5-498e-97bb-58b9eb675a55.png",
    rarity: "Rare",
    seller: "PuzzleGamingElite",
    description: "Cyberpunk Tetris champion with RGB gaming setup - master of the classic puzzle game in the digital age"
  }
];

export const Marketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isWalletConnected, getConnectedWallet } = useWallet();
  const { balance, refetch: refreshBalance } = useUserBalance();
  const [selectedCurrency, setSelectedCurrency] = useState<'cctr' | 'sol' | 'usdc' | 'pyusd'>('cctr');
  const [filter, setFilter] = useState('all');
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const simulateTransaction = async (currency: string, amount: number): Promise<string> => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `0x${Math.random().toString(16).slice(2, 42)}`;
  };

  const handlePurchase = async (nft: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a purchase",
        variant: "destructive"
      });
      return;
    }

    if (!isWalletConnected()) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make a purchase",
        variant: "destructive"
      });
      return;
    }

    const connectedWallet = getConnectedWallet();
    if (!connectedWallet) {
      toast({
        title: "No Wallet Found",
        description: "Please connect a wallet to proceed",
        variant: "destructive"
      });
      return;
    }

    const price = nft.price[selectedCurrency];
    const currencySymbol = selectedCurrency === 'cctr' ? '$CCTR' : 
                          selectedCurrency === 'sol' ? 'SOL' : 
                          selectedCurrency === 'usdc' ? 'USDC' : 'PYUSD';

    // Check CCTR balance if paying with CCTR
    if (selectedCurrency === 'cctr' && balance.cctr_balance < price) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${price} $CCTR but only have ${balance.cctr_balance} $CCTR`,
        variant: "destructive"
      });
      return;
    }

    setPurchasing(nft.id);

    try {
      toast({
        title: "🔄 Processing Purchase",
        description: `Buying ${nft.name} for ${price} ${currencySymbol}...`,
      });

      // Simulate transaction based on currency
      let transactionHash = '';
      if (selectedCurrency === 'cctr') {
        // For CCTR, simulate internal transfer
        transactionHash = `cctr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        // For crypto currencies, simulate blockchain transaction
        transactionHash = await simulateTransaction(selectedCurrency, price);
      }

      // Store purchase in database
      const { error: purchaseError } = await supabase
        .from('nft_purchases')
        .insert({
          user_id: user.id,
          nft_id: nft.id.toString(),
          nft_name: nft.name,
          price: price,
          currency: selectedCurrency,
          wallet_address: connectedWallet.address,
          transaction_hash: transactionHash,
          status: 'completed'
        });

      if (purchaseError) {
        console.error('Purchase storage error:', purchaseError);
        toast({
          title: "Purchase Failed",
          description: "Failed to record purchase. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update user balance if paying with CCTR
      if (selectedCurrency === 'cctr') {
        // Deduct CCTR balance
        const newBalance = balance.cctr_balance - price;
        const { error: balanceError } = await supabase
          .from('user_balances')
          .update({
            cctr_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (balanceError) {
          console.error('Balance update error:', balanceError);
          toast({
            title: "Payment Failed",
            description: "Failed to process CCTR payment. Please try again.",
            variant: "destructive"
          });
          return;
        }

        // Record the transaction
        const { error: transactionError } = await supabase
          .from('token_transactions')
          .insert({
            user_id: user.id,
            amount: -price,
            transaction_type: 'purchase',
            description: `NFT Purchase: ${nft.name}`
          });

        if (transactionError) {
          console.error('Transaction record error:', transactionError);
        }

        await refreshBalance();
      }

      toast({
        title: "🎉 Purchase Successful!",
        description: `${nft.name} has been transferred to your wallet: ${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}`,
      });

      // Show transaction details
      toast({
        title: "📋 Transaction Details",
        description: `Transaction Hash: ${transactionHash.slice(0, 10)}...`,
      });

    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "Something went wrong with your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const connectPlatform = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({
      title: `${platform} Opened!`,
      description: `Redirecting to ${platform} marketplace`,
    });
  };

  const filteredNFTs = filter === 'all' ? mockNFTs : mockNFTs.filter(nft => 
    nft.rarity.toLowerCase() === filter.toLowerCase()
  );

  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case 'cctr': return '$CCTR';
      case 'sol': return 'SOL';
      case 'usdc': return 'USDC';
      case 'pyusd': return 'PYUSD';
      default: return '$CCTR';
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
          🛒 NFT MARKETPLACE
          <Badge className="bg-neon-cyan text-black">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Platform Connections */}
          <Card className="holographic p-6">
            <h3 className="font-bold text-neon-cyan mb-4">🔗 Platform Connections</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => connectPlatform('Magic Eden', 'https://magiceden.io/')}
                className="cyber-button flex items-center gap-2"
              >
                🪄 Magic Eden
              </Button>
              <Button 
                onClick={() => connectPlatform('OpenSea', 'https://opensea.io/')}
                className="cyber-button flex items-center gap-2"
              >
                🌊 OpenSea
              </Button>
              <Button 
                onClick={() => connectPlatform('Tensor', 'https://tensor.trade/')}
                className="cyber-button flex items-center gap-2"
              >
                ⚡ Tensor
              </Button>
              <Button 
                onClick={() => connectPlatform('Solanart', 'https://solanart.io/')}
                className="cyber-button flex items-center gap-2"
              >
                🎨 Solanart
              </Button>
            </div>
          </Card>

          {/* Filters and Currency Selection */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'cyber-button' : 'border-neon-cyan text-neon-cyan'}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'legendary' ? 'default' : 'outline'}
                  onClick={() => setFilter('legendary')}
                  className={filter === 'legendary' ? 'cyber-button' : 'border-neon-purple text-neon-purple'}
                >
                  Legendary
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'epic' ? 'default' : 'outline'}
                  onClick={() => setFilter('epic')}
                  className={filter === 'epic' ? 'cyber-button' : 'border-neon-pink text-neon-pink'}
                >
                  Epic
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'rare' ? 'default' : 'outline'}
                  onClick={() => setFilter('rare')}
                  className={filter === 'rare' ? 'cyber-button' : 'border-neon-green text-neon-green'}
                >
                  Rare
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neon-cyan font-bold">Pay with:</span>
              <Select value={selectedCurrency} onValueChange={(value: 'cctr' | 'sol' | 'usdc' | 'pyusd') => setSelectedCurrency(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cctr">💎 $CCTR</SelectItem>
                  <SelectItem value="sol">☀️ SOL</SelectItem>
                  <SelectItem value="usdc">💵 USDC</SelectItem>
                  <SelectItem value="pyusd">💰 PYUSD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNFTs.map((nft) => (
              <Card key={nft.id} className="vending-machine overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center overflow-hidden">
                    {nft.image.startsWith('/') ? (
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="text-6xl">{nft.image}</span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-neon-cyan">{nft.name}</h3>
                      <Badge className={`${
                        nft.rarity === 'Legendary' ? 'bg-neon-purple text-white' :
                        nft.rarity === 'Epic' ? 'bg-neon-pink text-black' :
                        'bg-neon-green text-black'
                      }`}>
                        {nft.rarity}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{nft.description}</p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neon-purple">Seller: {nft.seller}</span>
                    </div>
                    
                    <div className="border-t border-neon-cyan/30 pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-neon-pink font-bold">
                          {nft.price[selectedCurrency]} {getCurrencySymbol()}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handlePurchase(nft)}
                        disabled={purchasing === nft.id}
                        className="w-full cyber-button"
                      >
                        {purchasing === nft.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            PROCESSING...
                          </div>
                        ) : (
                          "🛒 BUY NOW"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
