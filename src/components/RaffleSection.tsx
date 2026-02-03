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
import { CyberSlotsMachine } from './CyberSlotsMachine';
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
  const {
    user
  } = useAuth();
  const {
    primaryWallet,
    isWalletConnected,
    getWalletIcon,
    connectWallet
  } = useMultiWallet();
  const {
    createOrLoginWithWallet
  } = useWalletAuth();
  const {
    balance
  } = useUserBalance();
  const {
    eligibleChests,
    hasUnclaimedChests,
    unclaimedCount,
    claimChest
  } = useWinnerChests();
  const [selectedTickets, setSelectedTickets] = useState<{
    [key: string]: number;
  }>({});
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cctr'>('cctr');
  const [chestAnimationOpen, setChestAnimationOpen] = useState(false);
  const [openingChest, setOpeningChest] = useState<{
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    eligibilityId?: string;
  } | null>(null);
  const [currentChestIndex, setCurrentChestIndex] = useState(0);
  const [raffles] = useState<Raffle[]>([{
    id: '1',
    title: 'Gaming PC Ultimate',
    description: 'RTX 4090, i9-13900K, 32GB RAM',
    image: '/lovable-uploads/3fc5f3c0-2b28-4cff-acdc-7c3896ee635b.png',
    totalTickets: 1000,
    soldTickets: 750,
    ticketPrice: 10000,
    prizeValue: '$3,500',
    endDate: new Date('2024-12-31'),
    status: 'active'
  }, {
    id: '2',
    title: 'PlayStation 5 Bundle',
    description: 'PS5 Console + 3 Games + Extra Controller',
    image: '/lovable-uploads/8820a165-f5a8-4d8a-b9d4-8dca31666e27.png',
    totalTickets: 500,
    soldTickets: 320,
    ticketPrice: 5000,
    prizeValue: '$800',
    endDate: new Date('2024-12-25'),
    status: 'active'
  }, {
    id: '3',
    title: 'Meta Quest 3 VR Headset',
    description: 'Latest VR Technology + Elite Strap + Games',
    image: '/lovable-uploads/4933f71b-6c27-40c9-b87f-b2d11c68045b.png',
    totalTickets: 300,
    soldTickets: 180,
    ticketPrice: 7500,
    prizeValue: '$650',
    endDate: new Date('2024-12-28'),
    status: 'active'
  }, {
    id: '4',
    title: 'Steam Deck OLED',
    description: 'Portable PC Gaming + 1TB Storage + Premium Case',
    image: '/lovable-uploads/91d31922-bcdc-45bb-b3b6-4df169a8cfce.png',
    totalTickets: 400,
    soldTickets: 220,
    ticketPrice: 6000,
    prizeValue: '$550',
    endDate: new Date('2024-12-30'),
    status: 'active'
  }]);
  const treasureChests: TreasureChest[] = [{
    id: 'epic-chest',
    name: 'Epic Cyber Chest',
    rarity: 'epic',
    image: '/lovable-uploads/epic-cyber-chest.png',
    description: 'Epic rewards for skilled winners!',
    rewards: ['500-1000 CCC', 'Epic NFT', 'Tournament Pass']
  }, {
    id: 'rare-chest',
    name: 'Rare Cyber Chest',
    rarity: 'rare',
    image: '/lovable-uploads/rare-cyber-chest.png',
    description: 'Rare rewards with golden treasures!',
    rewards: ['250-500 CCC', 'Rare NFT', 'Game Credits']
  }, {
    id: 'legendary-chest',
    name: 'Legendary Cyber Chest',
    rarity: 'legendary',
    image: '/lovable-uploads/legendary-cyber-chest.png',
    description: 'Ultimate rewards for champions!',
    rewards: ['2000-5000 CCC', 'Legendary NFT', 'Premium Access']
  }, {
    id: 'common-chest',
    name: 'Cyber Chest',
    rarity: 'common',
    image: '/lovable-uploads/common-cyber-chest.png',
    description: 'Standard rewards for all players!',
    rewards: ['100-250 CCC', 'Common NFT', 'Bonus Credits']
  }, {
    id: 'standard-chest',
    name: 'Standard Cyber Chest',
    rarity: 'rare',
    image: '/lovable-uploads/standard-cyber-chest.png',
    description: 'Quality rewards for dedicated players!',
    rewards: ['250-500 CCC', 'Rare NFT', 'Game Pass']
  }];
  const currentChest = treasureChests[currentChestIndex];

  // Auto-rotate chests every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChestIndex(prev => (prev + 1) % treasureChests.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
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
        name: currentChest.name,
        rarity: currentChest.rarity,
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
      case 'common':
        return 'bg-gray-500';
      case 'rare':
        return 'bg-blue-500';
      case 'epic':
        return 'bg-purple-500';
      case 'legendary':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  const isAuthenticated = user || isWalletConnected;
  return <>
      {/* Chest Opening Animation Modal */}
      <ChestOpeningAnimation isOpen={chestAnimationOpen} onClose={handleChestAnimationClose} chestName={openingChest?.name || ''} chestRarity={openingChest?.rarity || 'common'} />

      {/* Unified Treasure & Raffle Section */}
      <Card className="arcade-frame border-2 border-neon-purple/30 overflow-hidden">
        {/* Section Header */}
        <CardHeader className="bg-gradient-to-r from-neon-purple/20 via-neon-cyan/10 to-neon-pink/20 border-b border-neon-cyan/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="font-display text-3xl bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-green bg-clip-text text-transparent">
                 CYBER CHEST   
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Win games for FREE chests or Enter raffles for epic prizes and Earn CCC
              </p>
            </div>
            <WalletStatusBar />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Winner's Treasure Section - Slots Machine */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-neon-green" />
              <h3 className="font-display text-xl text-neon-green">CYBER SLOTS VAULT</h3>
              <Badge className="bg-neon-green text-black animate-pulse text-xs">3 FREE SPINS DAILY</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Cyber Slots Machine - Now Full Width */}
              <CyberSlotsMachine 
                onWin={(rarity, tokens) => {
                  // Handle win - could open chest animation or award tokens
                  console.log(`Won ${tokens} CCC and ${rarity} chest!`);
                }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neon-cyan/20" />

          {/* Live Raffles Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-neon-pink" />
                <h3 className="font-display text-xl text-neon-pink">LIVE RAFFLES</h3>
              </div>
              {primaryWallet && <Badge className="bg-neon-green/20 text-neon-green border-neon-green w-fit">
                  🔗 {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
                </Badge>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {raffles.map(raffle => <Card key={raffle.id} className="holographic hover:scale-[1.02] transition-transform">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 rounded mb-3 overflow-hidden">
                      <img src={raffle.image} alt={raffle.title} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-neon-pink line-clamp-1">{raffle.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{raffle.description}</p>
                        <p className="text-neon-green font-bold text-sm">{raffle.prizeValue}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Tickets</span>
                          <span>{raffle.soldTickets}/{raffle.totalTickets}</span>
                        </div>
                        <Progress value={raffle.soldTickets / raffle.totalTickets * 100} className="h-1.5" />
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} className="text-neon-cyan" />
                        <span>Ends: {raffle.endDate.toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input type="number" min="1" max="10" value={selectedTickets[raffle.id] || 1} onChange={e => setSelectedTickets({
                      ...selectedTickets,
                      [raffle.id]: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                    })} className="w-14 h-8 text-xs" />
                        <span className="text-xs text-muted-foreground">
                          × {raffle.ticketPrice} = {(selectedTickets[raffle.id] || 1) * raffle.ticketPrice} CCC
                        </span>
                      </div>

                      <Button onClick={() => purchaseRaffleTickets(raffle.id, selectedTickets[raffle.id] || 1)} disabled={processingPayment === raffle.id || !isAuthenticated} className="cyber-button w-full text-xs py-2" size="sm">
                        {processingPayment === raffle.id ? "⏳ PROCESSING..." : !isAuthenticated ? "🔐 CONNECT WALLET" : `🎫 ENTER (${(selectedTickets[raffle.id] || 1) * raffle.ticketPrice} CCC)`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </CardContent>
      </Card>
    </>;
};
export default RaffleSection;