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
import { useWinnerChests } from '@/hooks/useWinnerChests';
import { supabase } from '@/integrations/supabase/client';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { Gift, Trophy, Ticket, Users, Clock, Wallet, Sparkles, Award, Star } from 'lucide-react';
import { ChestOpeningAnimation } from './ChestOpeningAnimation';

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
  const { eligibleChests, hasUnclaimedChests, unclaimedCount, claimChest } = useWinnerChests();
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cctr'>('cctr');
  const [chestAnimationOpen, setChestAnimationOpen] = useState(false);
  const [openingChest, setOpeningChest] = useState<{ name: string; rarity: 'common' | 'rare' | 'epic' | 'legendary'; eligibilityId?: string } | null>(null);

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
    },
    {
      id: '3',
      title: 'Meta Quest 3 VR Headset',
      description: 'Latest VR Technology + Elite Strap + Games',
      image: '/lovable-uploads/4933f71b-6c27-40c9-b87f-b2d11c68045b.png',
      totalTickets: 300,
      soldTickets: 180,
      ticketPrice: 75,
      prizeValue: '$650',
      endDate: new Date('2024-12-28'),
      status: 'active'
    },
    {
      id: '4',
      title: 'Steam Deck OLED',
      description: 'Portable PC Gaming + 1TB Storage + Premium Case',
      image: '/lovable-uploads/91d31922-bcdc-45bb-b3b6-4df169a8cfce.png',
      totalTickets: 400,
      soldTickets: 220,
      ticketPrice: 60,
      prizeValue: '$550',
      endDate: new Date('2024-12-30'),
      status: 'active'
    }
  ]);

  const [treasureChest] = useState<TreasureChest>({
    id: 'winner-chest',
    name: 'Winner\'s Treasure Vault',
    rarity: 'epic',
    image: '/lovable-uploads/93444d7b-5751-4c96-af43-5bae0bbf920b.png',
    description: 'FREE reward chest for game & tournament winners!',
    rewards: [
      '500-2000 CCTR Tokens',
      'Epic Gaming NFT',
      'Tournament Entry Pass',
      'Monthly Tournament Subscription',
      'Exclusive Game Beta Access',
      'Physical Gaming Merchandise',
      'Gaming Hardware Vouchers'
    ]
  });

  const connectStellarWallet = async () => {
    console.log('Please use the wallet connection modal to connect a Stellar wallet');
  };

  const purchaseRaffleTickets = async (raffleId: string, tickets: number) => {
    if (!user || !isWalletConnected) return;
    
    setProcessingPayment(raffleId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  const openWinnerChest = async (eligibilityId: string) => {
    if (!isWalletConnected || !hasUnclaimedChests) return;
    
    setProcessingPayment('winner-chest');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setOpeningChest({ 
        name: treasureChest.name, 
        rarity: treasureChest.rarity,
        eligibilityId 
      });
      setChestAnimationOpen(true);
    } catch (error) {
      console.error('Chest opening error:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleChestAnimationClose = async () => {
    // Claim the chest in the database when animation closes
    if (openingChest?.eligibilityId) {
      await claimChest(openingChest.eligibilityId, 'random', 'pending');
    }
    setChestAnimationOpen(false);
    setOpeningChest(null);
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

  return (
    <div className="space-y-8">
      {/* Chest Opening Animation Modal */}
      <ChestOpeningAnimation
        isOpen={chestAnimationOpen}
        onClose={handleChestAnimationClose}
        chestName={openingChest?.name || ''}
        chestRarity={openingChest?.rarity || 'common'}
      />
      {/* Header with Authentication Status */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center">
            🎰 MYSTERY TREASURE CHESTS & RAFFLES
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Open treasure chests for instant rewards • Enter raffles for big prizes • Earn CCTR tokens
          </p>
        </CardHeader>
        <CardContent>
          <WalletStatusBar />
        </CardContent>
      </Card>

      {/* Winner's Treasure Chest - FREE for winners only */}
      <Card className="arcade-frame border-2 border-neon-green/50">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
            🏆 WINNER'S TREASURE VAULT
            <Badge className="bg-neon-green text-black animate-pulse">FREE FOR WINNERS</Badge>
          </CardTitle>
          <p className="text-neon-cyan">Win games & tournaments to earn FREE treasure chest rewards! One chest per winner per game.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chest Display */}
            <Card className="vending-machine hover:scale-105 transition-transform">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 overflow-hidden relative group">
                  <img 
                    src={treasureChest.image} 
                    alt={treasureChest.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  {/* Animated sparkle overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <Sparkles className="absolute top-2 left-3 w-4 h-4 text-yellow-300 animate-pulse opacity-80" />
                    <Sparkles className="absolute top-4 right-4 w-3 h-3 text-white animate-ping opacity-60" style={{ animationDuration: '2s' }} />
                    <Sparkles className="absolute bottom-6 left-5 w-3 h-3 text-neon-cyan animate-pulse opacity-70" style={{ animationDelay: '0.5s' }} />
                    <Sparkles className="absolute bottom-3 right-6 w-4 h-4 text-neon-pink animate-ping opacity-50" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-yellow-200 animate-pulse opacity-60" style={{ animationDelay: '0.3s' }} />
                  </div>
                  {/* Shimmer sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  {/* Magical glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/30 via-transparent to-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-center">
                    <Badge className="bg-purple-500 text-white text-xs mb-2">
                      {treasureChest.rarity.toUpperCase()}
                    </Badge>
                    <h3 className="font-bold text-lg text-neon-cyan">{treasureChest.name}</h3>
                    <p className="text-sm text-muted-foreground">{treasureChest.description}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-neon-green">Possible Rewards:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {treasureChest.rewards.map((reward, index) => (
                        <li key={index}>• {reward}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-green mb-2">
                        🎁 FREE
                      </div>
                      <p className="text-xs text-muted-foreground">Win games or tournaments to claim</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eligibility & Claim Section */}
            <div className="space-y-4">
              {/* How to Earn */}
              <Card className="holographic p-4">
                <h4 className="font-bold text-neon-pink mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  How to Earn Free Chests
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-4 h-4 text-neon-cyan" />
                    Win a Trivia game (top score)
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-4 h-4 text-neon-cyan" />
                    Complete Neon Match 36 with a perfect score
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-4 h-4 text-neon-cyan" />
                    Place 1st in any Tournament
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    One chest per wallet per win
                  </li>
                </ul>
              </Card>

              {/* Your Chests Status */}
              <Card className="holographic p-4">
                <h4 className="font-bold text-neon-green mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Your Winner's Chests
                </h4>
                
                {!isWalletConnected ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    🔐 Connect wallet to view your chests
                  </p>
                ) : hasUnclaimedChests ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neon-green/10 rounded-lg border border-neon-green/30">
                      <span className="text-neon-green font-bold">
                        🎉 You have {unclaimedCount} chest{unclaimedCount > 1 ? 's' : ''} to open!
                      </span>
                    </div>
                    {eligibleChests.map((chest) => (
                      <Button
                        key={chest.id}
                        onClick={() => openWinnerChest(chest.id)}
                        disabled={processingPayment === 'winner-chest'}
                        className="cyber-button w-full"
                      >
                        {processingPayment === 'winner-chest' 
                          ? "⏳ OPENING..." 
                          : `🎁 OPEN CHEST (${chest.source_type}: ${chest.source_id})`
                        }
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm mb-2">No chests available</p>
                    <p className="text-xs text-neon-cyan">Win a game or tournament to earn one!</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Raffles */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-green">🎫 LIVE RAFFLES</CardTitle>
          <p className="text-neon-cyan">Enter raffles for a chance to win amazing prizes!</p>
          {primaryWallet && (
            <div className="text-center mt-2">
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                🔗 Connected: {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
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
                          ? "🔐 CONNECT WALLET" 
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
            <h3 className="text-xl font-bold text-neon-pink mb-2">Connect Your Stellar Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Stellar wallet to open treasure chests, enter raffles, and earn CCTR rewards
            </p>
            <Button onClick={connectStellarWallet} className="cyber-button">
              ✦ Connect Stellar Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
