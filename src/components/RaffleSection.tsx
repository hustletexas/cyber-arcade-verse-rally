import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Trophy, Ticket, Users, Clock, Wallet } from 'lucide-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface Raffle {
  id: string;
  title: string;
  description: string;
  prize_type: string;
  prize_name: string;
  prize_value: number;
  prize_image: string;
  ticket_price: number;
  max_tickets: number;
  tickets_sold: number;
  end_date: string;
  status: string;
  rarity: string;
}

interface PrizePool {
  type: 'nft' | 'cctr' | 'merch' | 'usdc';
  name: string;
  value: number;
  probability: number;
  image?: string;
}

const PRIZE_POOLS: { [key: string]: PrizePool[] } = {
  'Common': [
    { type: 'cctr', name: '500 CCTR Tokens', value: 500, probability: 0.4 },
    { type: 'merch', name: 'Cyber City Sticker Pack', value: 10, probability: 0.3 },
    { type: 'nft', name: 'Common Avatar NFT', value: 50, probability: 0.25 },
    { type: 'cctr', name: '1000 CCTR Tokens', value: 1000, probability: 0.05 }
  ],
  'Rare': [
    { type: 'cctr', name: '1500 CCTR Tokens', value: 1500, probability: 0.35 },
    { type: 'nft', name: 'Rare Weapon NFT', value: 150, probability: 0.3 },
    { type: 'merch', name: 'Premium T-Shirt', value: 50, probability: 0.25 },
    { type: 'cctr', name: '3000 CCTR Tokens', value: 3000, probability: 0.1 }
  ],
  'Epic': [
    { type: 'nft', name: 'Epic Character NFT', value: 400, probability: 0.4 },
    { type: 'cctr', name: '5000 CCTR Tokens', value: 5000, probability: 0.3 },
    { type: 'usdc', name: '25 USDC', value: 25, probability: 0.2 },
    { type: 'merch', name: 'Limited Edition Hoodie', value: 100, probability: 0.1 }
  ],
  'Legendary': [
    { type: 'nft', name: 'Legendary Skin NFT', value: 1000, probability: 0.35 },
    { type: 'cctr', name: '10000 CCTR Tokens', value: 10000, probability: 0.25 },
    { type: 'usdc', name: '100 USDC', value: 100, probability: 0.25 },
    { type: 'merch', name: 'Signed Gaming Chair', value: 500, probability: 0.15 }
  ]
};

export const RaffleSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isWalletConnected, primaryWallet, connectWallet } = useMultiWallet();
  const { createOrLoginWithWallet } = useWalletAuth();
  const { balance, refetch: refetchBalance } = useUserBalance();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketCounts, setTicketCounts] = useState<{[key: string]: number}>({});
  const [paymentMethods, setPaymentMethods] = useState<{[key: string]: 'cctr' | 'sol' | 'usdc'}>({});
  const [purchasing, setPurchasing] = useState<{[key: string]: boolean}>({});
  const [connection] = useState(new Connection('https://api.devnet.solana.com'));

  useEffect(() => {
    const treasureChests: Raffle[] = [
      {
        id: '1',
        title: 'Common Treasure Chest',
        description: 'Basic loot with surprise rewards',
        prize_type: 'random',
        prize_name: 'Random Prize: Merch, Small CCTR, or Common NFT',
        prize_value: 5000,
        prize_image: '/lovable-uploads/08a3dde3-268a-45e6-9985-248775e6cb58.png',
        ticket_price: 50,
        max_tickets: 2000,
        tickets_sold: 1240,
        end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        rarity: 'Common'
      },
      {
        id: '2',
        title: 'Rare Treasure Chest',
        description: 'Valuable rewards with better odds',
        prize_type: 'random',
        prize_name: 'Random Prize: Premium Merch, CCTR Bundle, or Rare NFT',
        prize_value: 15000,
        prize_image: '/lovable-uploads/6347bc0d-7044-4d7c-8264-0d89f8640c08.png',
        ticket_price: 150,
        max_tickets: 1000,
        tickets_sold: 560,
        end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        rarity: 'Rare'
      },
      {
        id: '3',
        title: 'Epic Treasure Chest',
        description: 'High-tier loot for serious collectors',
        prize_type: 'random',
        prize_name: 'Random Prize: Exclusive Merch, Large CCTR, Epic NFT, or USDC',
        prize_value: 40000,
        prize_image: '/lovable-uploads/7b8388cc-637c-4b0e-9a7e-d1fda1b2a279.png',
        ticket_price: 400,
        max_tickets: 500,
        tickets_sold: 178,
        end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        rarity: 'Epic'
      },
      {
        id: '4',
        title: 'Legendary Treasure Chest',
        description: 'Ultimate prize pool with maximum rewards',
        prize_type: 'random',
        prize_name: 'Random Prize: Limited Merch, Massive CCTR, Legendary NFT, or Big USDC',
        prize_value: 100000,
        prize_image: '/lovable-uploads/89628fec-79c5-4251-b4cb-915cceb7e9b0.png',
        ticket_price: 1000,
        max_tickets: 200,
        tickets_sold: 45,
        end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        rarity: 'Legendary'
      }
    ];
    
    setRaffles(treasureChests);
    setLoading(false);
  }, []);

  const selectRandomPrize = (rarity: string): PrizePool => {
    const prizePool = PRIZE_POOLS[rarity] || PRIZE_POOLS['Common'];
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const prize of prizePool) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }
    
    return prizePool[0]; // fallback to first prize
  };

  const connectWalletAndAuth = async () => {
    try {
      // First connect wallet if not connected
      if (!isWalletConnected) {
        if (window.solana && window.solana.isPhantom) {
          const response = await window.solana.connect();
          if (response?.publicKey) {
            await connectWallet('phantom', response.publicKey.toString());
          }
        } else {
          toast({
            title: "Phantom Wallet Required",
            description: "Please install Phantom wallet to play",
            variant: "destructive",
          });
          return;
        }
      }

      // Then authenticate with the connected wallet
      if (primaryWallet?.address && !user) {
        await createOrLoginWithWallet(primaryWallet.address);
      }

      toast({
        title: "Wallet Connected!",
        description: "You can now play treasure chests",
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPaymentPrice = (raffle: Raffle, paymentMethod: 'cctr' | 'sol' | 'usdc') => {
    const basePrice = raffle.ticket_price;
    switch (paymentMethod) {
      case 'cctr':
        return basePrice;
      case 'sol':
        return (basePrice * 0.0005); // Convert CCTR to SOL (example rate)
      case 'usdc':
        return (basePrice * 0.001); // Convert CCTR to USDC (example rate)
      default:
        return basePrice;
    }
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
      const transaction = new Transaction();
      
      if (paymentMethod === 'sol') {
        // SOL payment
        const lamports = amount * LAMPORTS_PER_SOL;
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey('11111111111111111111111111111112'), // System program
            lamports: Math.floor(lamports),
          })
        );
      }
      // For USDC, you would add SPL token transfer instruction here

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(txid);
      
      return txid;
    } catch (error) {
      console.error('Solana payment error:', error);
      throw error;
    }
  };

  const handlePurchaseTickets = async (raffleId: string) => {
    if (!user || !isWalletConnected || !primaryWallet) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const ticketCount = ticketCounts[raffleId] || 1;
    const paymentMethod = paymentMethods[raffleId] || 'cctr';
    const raffle = raffles.find(r => r.id === raffleId);
    
    if (!raffle) return;

    const totalCost = ticketCount * getPaymentPrice(raffle, paymentMethod);

    // Check balance for CCTR payments
    if (paymentMethod === 'cctr' && balance.cctr_balance < totalCost) {
      toast({
        title: "Insufficient CCTR Tokens",
        description: `You need ${totalCost} CCTR tokens but only have ${balance.cctr_balance}`,
        variant: "destructive",
      });
      return;
    }

    setPurchasing(prev => ({ ...prev, [raffleId]: true }));

    try {
      let txHash = '';

      // Process payment based on method
      if (paymentMethod === 'cctr') {
        // CCTR payment - update balance directly
        const newBalance = balance.cctr_balance - totalCost;
        
        const { error: updateError } = await supabase
          .from('user_balances')
          .update({ 
            cctr_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        
        txHash = `cctr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        // SOL/USDC payment via Solana
        txHash = await processSolanaPayment(totalCost, paymentMethod);
      }

      // Process each ticket purchase and distribute prizes
      const wonPrizes = [];
      let totalCCTRWon = 0;

      for (let i = 0; i < ticketCount; i++) {
        const randomPrize = selectRandomPrize(raffle.rarity);
        wonPrizes.push(randomPrize);
        
        if (randomPrize.type === 'cctr') {
          totalCCTRWon += randomPrize.value;
        }
      }

      // Add won CCTR tokens to balance
      if (totalCCTRWon > 0) {
        const currentBalance = paymentMethod === 'cctr' 
          ? balance.cctr_balance - totalCost + totalCCTRWon
          : balance.cctr_balance + totalCCTRWon;
          
        const { error: rewardError } = await supabase
          .from('user_balances')
          .update({ 
            cctr_balance: currentBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (rewardError) console.error('Reward update error:', rewardError);
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: paymentMethod === 'cctr' ? -totalCost : totalCCTRWon,
          transaction_type: 'chest_purchase',
          description: `Opened ${ticketCount} ${raffle.title}(s) with ${paymentMethod.toUpperCase()} - Won: ${wonPrizes.map(p => p.name).join(', ')}`
        });

      if (transactionError) {
        console.error('Transaction record error:', transactionError);
      }

      toast({
        title: "🎉 Chest Opened Successfully!",
        description: `You won: ${wonPrizes.map(p => p.name).join(', ')}`,
      });
      
      // Update local state
      setRaffles(prev => prev.map(raffle => 
        raffle.id === raffleId 
          ? { ...raffle, tickets_sold: raffle.tickets_sold + ticketCount }
          : raffle
      ));
      
      await refetchBalance();
      setTicketCounts(prev => ({ ...prev, [raffleId]: 1 }));

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to open chest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(prev => ({ ...prev, [raffleId]: false }));
    }
  };

  const getRarityColor = (rarity: string | undefined) => {
    if (!rarity) return 'bg-gray-500';
    
    switch (rarity) {
      case 'Legendary': return 'bg-yellow-500';
      case 'Epic': return 'bg-purple-500';
      case 'Rare': return 'bg-blue-500';
      case 'Common': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPrizeIcon = (prizeType: string) => {
    return '🎁';
  };

  const formatTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getTrophyIcon = (rarity: string) => {
    if (rarity === 'Rare') {
      return <Trophy className="mx-auto text-yellow-500 mb-1" size={20} />;
    }
    return <Trophy className="mx-auto text-neon-pink mb-1" size={20} />;
  };

  if (loading) {
    return (
      <Card className="arcade-frame">
        <CardContent className="p-8 text-center">
          <div className="text-neon-cyan">Loading treasure chests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-neon-pink mb-2">🏴‍☠️ MYSTERY TREASURE CHESTS</h3>
        <p className="text-neon-cyan">Each chest contains random prizes! Higher rarity = Better rewards!</p>
        {user && isWalletConnected && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge className="bg-neon-green text-black">
              <Wallet size={14} className="mr-1" />
              {primaryWallet?.address.slice(0, 6)}...{primaryWallet?.address.slice(-4)}
            </Badge>
            <Badge className="bg-neon-cyan text-black">
              💎 {balance.cctr_balance.toLocaleString()} CCTR
            </Badge>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {raffles.map((raffle) => (
          <Card key={raffle.id} className="holographic overflow-hidden relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className={`${getRarityColor(raffle.rarity)} text-white font-bold`}>
                  {raffle.rarity ? raffle.rarity.toUpperCase() : 'UNKNOWN'}
                </Badge>
                <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
                  <Clock size={12} className="mr-1" />
                  {formatTimeLeft(raffle.end_date)}
                </Badge>
              </div>
              <CardTitle className="text-lg text-neon-cyan">{raffle.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{raffle.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 rounded-lg overflow-hidden">
                <img 
                  src={raffle.prize_image} 
                  alt={raffle.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>

              <div className="bg-black/30 rounded-lg p-4 border border-neon-purple/30">
                <h4 className="font-bold text-neon-green mb-2">🎁 Possible Rewards</h4>
                <div className="space-y-1 text-xs">
                  {PRIZE_POOLS[raffle.rarity]?.map((prize, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-neon-cyan">{prize.name}</span>
                      <span className="text-neon-purple">{(prize.probability * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  {getTrophyIcon(raffle.rarity)}
                  <p className="text-neon-pink font-bold">{raffle.ticket_price} CCTR</p>
                  <p className="text-muted-foreground">Per Chest</p>
                </div>
                <div className="text-center">
                  <Users className="mx-auto text-neon-cyan mb-1" size={20} />
                  <p className="text-neon-cyan font-bold">
                    {raffle.tickets_sold}/{raffle.max_tickets}
                  </p>
                  <p className="text-muted-foreground">Opened</p>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    raffle.rarity === 'Legendary' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    raffle.rarity === 'Epic' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                    raffle.rarity === 'Rare' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    'bg-gradient-to-r from-green-400 to-green-600'
                  }`}
                  style={{ width: `${(raffle.tickets_sold / raffle.max_tickets) * 100}%` }}
                />
              </div>

              {user && isWalletConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={Math.min(10, raffle.max_tickets - raffle.tickets_sold)}
                      value={ticketCounts[raffle.id] || 1}
                      onChange={(e) => setTicketCounts(prev => ({
                        ...prev,
                        [raffle.id]: parseInt(e.target.value) || 1
                      }))}
                      className="flex-1"
                      placeholder="Chests"
                    />
                  </div>

                  <Select 
                    value={paymentMethods[raffle.id] || 'cctr'} 
                    onValueChange={(value: 'cctr' | 'sol' | 'usdc') => 
                      setPaymentMethods(prev => ({ ...prev, [raffle.id]: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cctr">
                        💎 {((ticketCounts[raffle.id] || 1) * getPaymentPrice(raffle, 'cctr')).toFixed(0)} CCTR
                      </SelectItem>
                      <SelectItem value="sol">
                        ☀️ {((ticketCounts[raffle.id] || 1) * getPaymentPrice(raffle, 'sol')).toFixed(4)} SOL
                      </SelectItem>
                      <SelectItem value="usdc">
                        💵 {((ticketCounts[raffle.id] || 1) * getPaymentPrice(raffle, 'usdc')).toFixed(2)} USDC
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={() => handlePurchaseTickets(raffle.id)}
                    disabled={purchasing[raffle.id] || raffle.tickets_sold >= raffle.max_tickets}
                    className="w-full cyber-button"
                  >
                    {purchasing[raffle.id] ? (
                      "🎁 OPENING CHEST..."
                    ) : raffle.tickets_sold >= raffle.max_tickets ? (
                      "🚫 SOLD OUT"
                    ) : (
                      "🎮 PLAY NOW"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Connect your Solana wallet to play
                  </p>
                  <Button 
                    onClick={connectWalletAndAuth}
                    className="w-full cyber-button flex items-center gap-2"
                  >
                    <Wallet size={16} />
                    🎮 PLAY NOW
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
