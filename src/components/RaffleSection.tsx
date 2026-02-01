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
    ticketPrice: 100,
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
    ticketPrice: 50,
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
    ticketPrice: 75,
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
    ticketPrice: 60,
    prizeValue: '$550',
    endDate: new Date('2024-12-30'),
    status: 'active'
  }]);
  const treasureChests: TreasureChest[] = [{
    id: 'epic-chest',
    name: 'Epic Treasure Vault',
    rarity: 'epic',
    image: '/lovable-uploads/93444d7b-5751-4c96-af43-5bae0bbf920b.png',
    description: 'Epic rewards for skilled winners!',
    rewards: ['500-1000 CCTR', 'Epic NFT', 'Tournament Pass']
  }, {
    id: 'rare-chest',
    name: 'Rare Treasure Vault',
    rarity: 'rare',
    image: '/lovable-uploads/rare-chest.png',
    description: 'Rare rewards with golden treasures!',
    rewards: ['250-500 CCTR', 'Rare NFT', 'Game Credits']
  }, {
    id: 'legendary-chest',
    name: 'Legendary Treasure Vault',
    rarity: 'legendary',
    image: '/lovable-uploads/legendary-chest.png',
    description: 'Ultimate rewards for champions!',
    rewards: ['2000-5000 CCTR', 'Legendary NFT', 'Premium Access']
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
                 TREASURE VAULT & RAFFLES
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Win games for FREE chests • Enter raffles for epic prizes • Earn CCTR
              </p>
            </div>
            <WalletStatusBar />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Winner's Treasure Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-neon-green" />
              <h3 className="font-display text-xl text-neon-green">WINNER'S TREASURE VAULT</h3>
              <Badge className="bg-neon-green text-black animate-pulse text-xs">FREE FOR WINNERS</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Chest Display - Rotating Carousel */}
              <Card className="vending-machine hover:scale-[1.02] transition-transform relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-44 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 overflow-hidden relative group">
                    <img src={currentChest.image} alt={currentChest.name} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 animate-fade-in" key={currentChest.id} />
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <Sparkles className="absolute top-2 left-3 w-4 h-4 text-yellow-300 animate-pulse opacity-80" />
                      <Sparkles className="absolute top-4 right-4 w-3 h-3 text-white animate-ping opacity-60" style={{
                      animationDuration: '2s'
                    }} />
                      <Sparkles className="absolute bottom-3 right-6 w-4 h-4 text-neon-pink animate-ping opacity-50" style={{
                      animationDuration: '3s',
                      animationDelay: '1s'
                    }} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-white text-xs ${currentChest.rarity === 'legendary' ? 'bg-yellow-500' : currentChest.rarity === 'rare' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                        {currentChest.rarity.toUpperCase()}
                      </Badge>
                      <span className="text-xl font-bold text-neon-green">🎁 FREE</span>
                    </div>
                    <h4 className="font-bold text-neon-cyan text-sm">{currentChest.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{currentChest.description}</p>
                    
                    {/* Carousel Dots */}
                    <div className="flex justify-center gap-1.5 pt-1">
                      {treasureChests.map((_, idx) => <button key={idx} onClick={() => setCurrentChestIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentChestIndex ? 'bg-neon-cyan w-4' : 'bg-muted-foreground/40 hover:bg-muted-foreground'}`} />)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How to Earn - Compact */}
              <Card className="holographic p-4 flex flex-col justify-center">
                <h4 className="font-bold text-neon-pink mb-3 flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4" />
                  How to Earn Free Chests
                </h4>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                    Win a Trivia game (top score)
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                    Complete Neon Match 36 perfectly
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                    Place 1st in any Tournament
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                    One chest per wallet per win
                  </li>
                </ul>
              </Card>

              {/* Your Chests Status - Compact */}
              <Card className="holographic p-4 flex flex-col justify-center">
                <h4 className="font-bold text-neon-green mb-3 flex items-center gap-2 text-sm">
                  <Gift className="w-4 h-4" />
                  Your Winner's Chests
                </h4>
                
                {!isWalletConnected ? <p className="text-xs text-muted-foreground text-center py-2">
                    🔐 Connect wallet to view chests
                  </p> : hasUnclaimedChests ? <div className="space-y-2">
                    <div className="p-2 bg-neon-green/10 rounded-lg border border-neon-green/30 text-center">
                      <span className="text-neon-green font-bold text-sm">
                        🎉 {unclaimedCount} chest{unclaimedCount > 1 ? 's' : ''} to open!
                      </span>
                    </div>
                    {eligibleChests.slice(0, 2).map(chest => <Button key={chest.id} onClick={() => openWinnerChest(chest.id)} disabled={processingPayment === 'winner-chest'} className="cyber-button w-full text-xs py-2" size="sm">
                        {processingPayment === 'winner-chest' ? "⏳ OPENING..." : "🎁 OPEN CHEST"}
                      </Button>)}
                  </div> : <div className="text-center py-2">
                    <p className="text-muted-foreground text-xs mb-1">No chests available</p>
                    <p className="text-xs text-neon-cyan">Win a game to earn one!</p>
                  </div>}
              </Card>
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
                          × {raffle.ticketPrice} = {(selectedTickets[raffle.id] || 1) * raffle.ticketPrice} CCTR
                        </span>
                      </div>

                      <Button onClick={() => purchaseRaffleTickets(raffle.id, selectedTickets[raffle.id] || 1)} disabled={processingPayment === raffle.id || !isAuthenticated} className="cyber-button w-full text-xs py-2" size="sm">
                        {processingPayment === raffle.id ? "⏳ PROCESSING..." : !isAuthenticated ? "🔐 CONNECT WALLET" : `🎫 ENTER (${(selectedTickets[raffle.id] || 1) * raffle.ticketPrice} CCTR)`}
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