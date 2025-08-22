import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
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
  image: string;
  totalTickets: number;
  soldTickets: number;
  ticketPrice: number;
  prizeValue: string;
  endDate: Date;
  status: 'active' | 'ended' | 'upcoming';
}

interface TreasureChest {
  id: string;
  name: string;
  price: {
    cctr: number;
    sol?: number;
    usdc?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  description: string;
  rewards: string[];
}

export const RaffleSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected, getWalletIcon, connectWallet } = useMultiWallet();
  const { createOrLoginWithWallet } = useWalletAuth();
  const { balance } = useUserBalance();
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cctr' | 'sol' | 'usdc'>('cctr');

  const [raffles] = useState<Raffle[]>([
    {
      id: '1',
      title: 'Gaming PC Ultimate',
      description: 'RTX 4090, i9-13900K, 32GB RAM',
      image: '/lovable-uploads/3fc5f3c0-2b28-4cff-acdc-7c3896ee635b.png',
      totalTickets: 1000,
      soldTickets: 750,
      ticketPrice: 100,
      prizeValue: '$3,500',
      endDate: new Date('2024-12-31'),
      status: 'active'
    },
    {
      id: '2',
      title: 'PlayStation 5 Bundle',
      description: 'PS5 Console + 3 Games + Extra Controller',
      image: '/lovable-uploads/8820a165-f5a8-4d8a-b9d4-8dca31666e27.png',
      totalTickets: 500,
      soldTickets: 320,
      ticketPrice: 50,
      prizeValue: '$800',
      endDate: new Date('2024-12-25'),
      status: 'active'
    }
  ]);

  const [treasureChests] = useState<TreasureChest[]>([
    {
      id: 'common',
      name: 'Common Chest',
      price: { cctr: 100, sol: 0.1, usdc: 5 },
      rarity: 'common',
      image: '/lovable-uploads/378a8773-5320-4d49-8779-341407974bb9.png',
      description: 'Basic rewards for beginners',
      rewards: ['10-50 CCTR', 'Common NFT', 'Discord Role']
    },
    {
      id: 'rare',
      name: 'Rare Chest',
      price: { cctr: 500, sol: 0.5, usdc: 25 },
      rarity: 'rare',
      image: '/lovable-uploads/6347bc0d-7044-4d7c-8264-0d89f8640c08.png',
      description: 'Better rewards for dedicated players',
      rewards: ['100-300 CCTR', 'Rare NFT', 'Exclusive Avatar']
    },
    {
      id: 'epic',
      name: 'Epic Chest',
      price: { cctr: 1500, sol: 1.5, usdc: 75 },
      rarity: 'epic',
      image: '/lovable-uploads/93444d7b-5751-4c96-af43-5bae0bbf920b.png',
      description: 'Premium rewards for champions',
      rewards: ['500-1000 CCTR', 'Epic NFT', 'Tournament Entry']
    },
    {
      id: 'legendary',
      name: 'Legendary Chest',
      price: { cctr: 5000, sol: 5.0, usdc: 250 },
      rarity: 'legendary',
      image: '/lovable-uploads/db171c4b-20b7-4e34-8a56-a84fc425b903.png',
      description: 'Ultimate rewards for legends',
      rewards: ['2000-5000 CCTR', 'Legendary NFT', 'Physical Prize']
    }
  ]);

  const connectWalletForChests = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        if (response?.publicKey) {
          await connectWallet('phantom', response.publicKey.toString());
        }
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const purchaseRaffleTickets = async (raffleId: string, tickets: number) => {
    if (!user || !isWalletConnected) return;
    
    setProcessingPayment(raffleId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Purchased ${tickets} tickets for raffle ${raffleId}`);
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  const openTreasureChest = async (chestId: string, paymentMethod: 'cctr' | 'sol' | 'usdc') => {
    if (!user || !isWalletConnected) return;
    
    setProcessingPayment(chestId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Opened treasure chest ${chestId} with ${paymentMethod}`);
    } catch (error) {
      console.error('Chest opening error:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const isAuthenticated = user || isWalletConnected;
  const connectedWallet = primaryWallet;

  return (
    <div className="space-y-8">
      {/* Header with Authentication Status */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center">
            🎰 MYSTERY TREASURE CHESTS & RAFFLES
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Open treasure chests for instant rewards • Enter raffles for big prizes • Earn CCTR tokens
          </p>
          {connectedWallet && (
            <div className="text-center mt-2">
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                🔗 Wallet: {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-4)}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Mystery Treasure Chests */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-pink">🏴‍☠️ MYSTERY TREASURE CHESTS</CardTitle>
          <p className="text-neon-cyan">Each chest contains random prizes! Higher rarity = Better rewards!</p>
          {connectedWallet && (
            <div className="text-center mt-2">
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                🔗 Wallet: {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-4)}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {treasureChests.map((chest) => (
              <Card key={chest.id} className="vending-machine hover:scale-105 transition-transform">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 overflow-hidden">
                    <img 
                      src={chest.image} 
                      alt={chest.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-center">
                      <Badge className={`${getRarityColor(chest.rarity)} text-white text-xs mb-2`}>
                        {chest.rarity.toUpperCase()}
                      </Badge>
                      <h3 className="font-bold text-lg text-neon-cyan">{chest.name}</h3>
                      <p className="text-sm text-muted-foreground">{chest.description}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-neon-green">Possible Rewards:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {chest.rewards.map((reward, index) => (
                          <li key={index}>• {reward}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <Button
                          variant={selectedPaymentMethod === 'cctr' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedPaymentMethod('cctr')}
                          className="text-xs"
                        >
                          {chest.price.cctr} CCTR
                        </Button>
                        <Button
                          variant={selectedPaymentMethod === 'sol' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedPaymentMethod('sol')}
                          className="text-xs"
                        >
                          {chest.price.sol} SOL
                        </Button>
                        <Button
                          variant={selectedPaymentMethod === 'usdc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedPaymentMethod('usdc')}
                          className="text-xs"
                        >
                          ${chest.price.usdc}
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={() => openTreasureChest(chest.id, selectedPaymentMethod)}
                        disabled={processingPayment === chest.id || !isAuthenticated}
                        className="cyber-button w-full"
                      >
                        {processingPayment === chest.id 
                          ? "⏳ OPENING..." 
                          : !isAuthenticated 
                            ? "🔐 CONNECT TO PLAY" 
                            : "🎁 OPEN CHEST"
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Raffles */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-green">🎫 LIVE RAFFLES</CardTitle>
          <p className="text-neon-cyan">Enter raffles for a chance to win amazing prizes!</p>
          {connectedWallet && (
            <div className="text-center mt-2">
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                🔗 Wallet: {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-4)}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {raffles.map((raffle) => (
              <Card key={raffle.id} className="holographic">
                <CardContent className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 rounded mb-4 overflow-hidden">
                    <img 
                      src={raffle.image} 
                      alt={raffle.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl text-neon-pink">{raffle.title}</h3>
                      <p className="text-muted-foreground">{raffle.description}</p>
                      <p className="text-neon-green font-bold">Prize Value: {raffle.prizeValue}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tickets Sold</span>
                        <span>{raffle.soldTickets}/{raffle.totalTickets}</span>
                      </div>
                      <Progress value={(raffle.soldTickets / raffle.totalTickets) * 100} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-neon-cyan" />
                      <span className="text-sm">Ends: {raffle.endDate.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`tickets-${raffle.id}`} className="text-sm">Tickets:</Label>
                      <Input
                        id={`tickets-${raffle.id}`}
                        type="number"
                        min="1"
                        max="10"
                        value={selectedTickets[raffle.id] || 1}
                        onChange={(e) => setSelectedTickets({
                          ...selectedTickets,
                          [raffle.id]: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                        })}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        × {raffle.ticketPrice} CCTR = {(selectedTickets[raffle.id] || 1) * raffle.ticketPrice} CCTR
                      </span>
                    </div>

                    <Button 
                      onClick={() => purchaseRaffleTickets(raffle.id, selectedTickets[raffle.id] || 1)}
                      disabled={processingPayment === raffle.id || !isAuthenticated}
                      className="cyber-button w-full"
                    >
                      {processingPayment === raffle.id 
                        ? "⏳ PROCESSING..." 
                        : !isAuthenticated 
                          ? "🔐 CONNECT TO ENTER" 
                          : `🎫 ENTER RAFFLE (${(selectedTickets[raffle.id] || 1) * raffle.ticketPrice} CCTR)`
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connect Wallet Section */}
      {!isAuthenticated && (
        <Card className="arcade-frame border-neon-pink/30">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-neon-pink mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet to open treasure chests, enter raffles, and earn CCTR rewards
            </p>
            <Button onClick={connectWalletForChests} className="cyber-button">
              🚀 Connect Phantom Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
