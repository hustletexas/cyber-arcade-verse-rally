import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';
import { Coins, Image, RefreshCw, ExternalLink, Copy } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LoadingText } from '@/components/ui/loading-states';

interface SolanaNFT {
  mint: string;
  name: string;
  image: string;
  collection?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export const WalletBalanceDisplay = () => {
  const { balance, loading, claimRewards } = useUserBalance();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<SolanaNFT[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [solBalance, setSolBalance] = useState(0);

  // Mock NFT data for demonstration
  const mockNFTs: SolanaNFT[] = [
    {
      mint: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      name: "Cyber City Arcade Genesis #001",
      image: "/lovable-uploads/618813b4-8ef1-495f-b103-dd4f3612befb.png",
      collection: "Cyber City Collection",
      description: "Genesis NFT from Cyber City Arcade - Your gateway to the ultimate Web3 gaming experience",
      attributes: [
        { trait_type: "Rarity", value: "Genesis" },
        { trait_type: "Power", value: "9000" },
        { trait_type: "Element", value: "Cyber" }
      ]
    },
    {
      mint: "5fGHEiw6QgbQGb8WkTvdVtk9YrS4PQ2kFjLf8t9Nq3xA",
      name: "Arcade Token #789",
      image: "/lovable-uploads/8820a165-f5a8-4d8a-b9d4-8dca31666e27.png",
      collection: "Arcade Tokens",
      description: "Special arcade token for exclusive game access",
      attributes: [
        { trait_type: "Game Access", value: "Premium" },
        { trait_type: "Boost", value: "2x Rewards" }
      ]
    },
    {
      mint: "3tGHeiw8QgbQGb9WkTvdVtk9YrS5PQ2kFjLf8t9Nq4xB",
      name: "Neon Sword",
      image: "/lovable-uploads/91d31922-bcdc-45bb-b3b6-4df169a8cfce.png",
      collection: "Cyber Weapons",
      description: "A legendary neon sword with special abilities",
      attributes: [
        { trait_type: "Damage", value: "850" },
        { trait_type: "Element", value: "Electric" },
        { trait_type: "Rarity", value: "Epic" }
      ]
    }
  ];

  useEffect(() => {
    if (isWalletConnected && primaryWallet) {
      fetchWalletData();
    }
  }, [isWalletConnected, primaryWallet]);

  const fetchWalletData = async () => {
    if (!primaryWallet) return;
    
    setLoadingNFTs(true);
    try {
      // Simulate fetching SOL balance
      setSolBalance(0.5234);
      
      // For now, use mock NFT data
      // In production, you would fetch real NFTs from Solana
      setTimeout(() => {
        setNfts(mockNFTs);
        setLoadingNFTs(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setLoadingNFTs(false);
      toast({
        title: "Error",
        description: "Failed to fetch wallet data",
        variant: "destructive"
      });
    }
  };

  const handleClaimRewards = async () => {
    const result = await claimRewards();
    if (result?.success) {
      toast({
        title: "🎉 Rewards Claimed!",
        description: `Successfully claimed ${balance.claimable_rewards} $CCTR tokens!`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!isWalletConnected || !primaryWallet) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please connect a wallet to view balance and assets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Wallet Overview
            </span>
            <Button
              onClick={fetchWalletData}
              size="sm"
              variant="outline"
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
            >
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-neon-purple text-black">
              {primaryWallet.type.toUpperCase()}
            </Badge>
            <code className="text-sm bg-background/50 px-2 py-1 rounded">
              {primaryWallet.address}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(primaryWallet.address, 'Wallet address')}
            >
              <Copy size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="balances" className="w-full">
        <TabsList className="grid w-full grid-cols-2 arcade-frame">
          <TabsTrigger value="balances" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
            <Coins size={16} className="mr-2" />
            Balances
          </TabsTrigger>
          <TabsTrigger value="nfts" className="data-[state=active]:bg-neon-purple data-[state=active]:text-black">
            <Image size={16} className="mr-2" />
            NFTs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CCTR Balance */}
            <Card className="vending-machine">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black text-neon-green mb-2">
                  {loading ? '...' : balance.cctr_balance.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mb-2">$CCTR Tokens</p>
                <div className="text-lg text-neon-purple">
                  ≈ ${loading ? '...' : (balance.cctr_balance * 0.045).toFixed(2)} USD
                </div>
              </CardContent>
            </Card>

            {/* Claimable Rewards */}
            <Card className="vending-machine">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black text-neon-pink mb-2">
                  {loading ? '...' : balance.claimable_rewards.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mb-2">Claimable $CCTR</p>
                <Button 
                  onClick={handleClaimRewards}
                  disabled={loading || balance.claimable_rewards === 0}
                  size="sm"
                  className="cyber-button w-full"
                >
                  {balance.claimable_rewards === 0 ? 'NO REWARDS' : 'CLAIM'}
                </Button>
              </CardContent>
            </Card>

            {/* SOL Balance */}
            <Card className="vending-machine">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black text-neon-yellow mb-2">
                  {solBalance.toFixed(4)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">SOL</p>
                <div className="text-lg text-neon-cyan">
                  ≈ ${(solBalance * 23.45).toFixed(2)} USD
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nfts" className="space-y-4">
          {loadingNFTs ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" variant="matrix" className="mx-auto mb-4" />
              <LoadingText text="Loading NFTs" className="text-lg" />
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-8">
              <Image className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">No NFTs found in this wallet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nfts.map((nft, index) => (
                <Card key={nft.mint} className="arcade-frame overflow-hidden">
                  <div className="aspect-square relative">
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                    {nft.collection && (
                      <Badge className="absolute top-2 left-2 bg-neon-purple text-black text-xs">
                        {nft.collection}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-neon-cyan mb-2">{nft.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {nft.description}
                    </p>
                    
                    {nft.attributes && (
                      <div className="space-y-1 mb-3">
                        {nft.attributes.slice(0, 2).map((attr, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{attr.trait_type}:</span>
                            <span className="text-neon-green font-bold">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(nft.mint, 'NFT mint address')}
                        className="flex-1 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                      >
                        <Copy size={12} className="mr-1" />
                        Copy Mint
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://solscan.io/token/${nft.mint}`, '_blank')}
                        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                      >
                        <ExternalLink size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
