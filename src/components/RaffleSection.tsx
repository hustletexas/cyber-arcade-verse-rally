
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Trophy, Ticket, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export const RaffleSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isWalletConnected } = useWallet();
  const { balance, refetch: refetchBalance } = useUserBalance();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketCounts, setTicketCounts] = useState<{[key: string]: number}>({});
  const [purchasing, setPurchasing] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Treasure chest raffles with random prizes
    const treasureChests: Raffle[] = [
      {
        id: '1',
        title: 'Common Treasure Chest',
        description: 'Basic loot with surprise rewards',
        prize_type: 'random',
        prize_name: 'Random Prize: Merch, Small CCTR, or Common NFT',
        prize_value: 5000, // $50
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
        prize_value: 15000, // $150
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
        prize_value: 40000, // $400
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
        prize_value: 100000, // $1000
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

  const handleLoginToPlay = () => {
    navigate('/auth');
  };

  const handlePurchaseTickets = async (raffleId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase raffle tickets",
        variant: "destructive",
      });
      return;
    }

    if (!isWalletConnected()) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Solana wallet to purchase tickets",
        variant: "destructive",
      });
      return;
    }

    const ticketCount = ticketCounts[raffleId] || 1;
    const raffle = raffles.find(r => r.id === raffleId);
    
    if (!raffle) return;

    const totalCost = ticketCount * raffle.ticket_price;

    // Check if user has enough CCTR tokens
    if (balance.cctr_balance < totalCost) {
      toast({
        title: "Insufficient CCTR Tokens",
        description: `You need ${totalCost} CCTR tokens but only have ${balance.cctr_balance}`,
        variant: "destructive",
      });
      return;
    }

    setPurchasing(prev => ({ ...prev, [raffleId]: true }));

    try {
      // Call the purchase raffle ticket edge function
      const { data, error } = await supabase.functions.invoke('purchase-raffle-ticket', {
        body: {
          raffleId: raffleId,
          ticketCount: ticketCount,
          totalCost: totalCost
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "🎫 Tickets Purchased!",
        description: `Successfully purchased ${ticketCount} ticket(s) for ${totalCost} CCTR tokens. Good luck!`,
      });
      
      // Update local state
      setRaffles(prev => prev.map(raffle => 
        raffle.id === raffleId 
          ? { ...raffle, tickets_sold: raffle.tickets_sold + ticketCount }
          : raffle
      ));
      
      // Refresh user balance
      await refetchBalance();
      
      setTicketCounts(prev => ({ ...prev, [raffleId]: 1 }));

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase tickets",
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
    return '🎁'; // Treasure chest always shows gift icon
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
        {user && (
          <p className="text-neon-green mt-2">
            Your Balance: {balance.cctr_balance.toLocaleString()} CCTR tokens
          </p>
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
              {/* Treasure Chest Image */}
              <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 rounded-lg overflow-hidden">
                <img 
                  src={raffle.prize_image} 
                  alt={raffle.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>

              {/* Prize Details */}
              <div className="bg-black/30 rounded-lg p-4 border border-neon-purple/30">
                <h4 className="font-bold text-neon-green mb-2">🎁 Random Prize</h4>
                <p className="text-neon-cyan text-sm font-semibold">{raffle.prize_name}</p>
                <p className="text-sm text-neon-purple mt-1">
                  Max Value: ${(raffle.prize_value / 100).toFixed(2)}
                </p>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <Ticket className="mx-auto text-neon-pink mb-1" size={20} />
                  <p className="text-neon-pink font-bold">{raffle.ticket_price} CCTR</p>
                  <p className="text-muted-foreground">Per Ticket</p>
                </div>
                <div className="text-center">
                  <Users className="mx-auto text-neon-cyan mb-1" size={20} />
                  <p className="text-neon-cyan font-bold">
                    {raffle.tickets_sold}/{raffle.max_tickets}
                  </p>
                  <p className="text-muted-foreground">Sold</p>
                </div>
              </div>

              {/* Progress Bar */}
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

              {/* Purchase Section */}
              {user && isWalletConnected() ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={raffle.max_tickets - raffle.tickets_sold}
                      value={ticketCounts[raffle.id] || 1}
                      onChange={(e) => setTicketCounts(prev => ({
                        ...prev,
                        [raffle.id]: parseInt(e.target.value) || 1
                      }))}
                      className="flex-1"
                      placeholder="Tickets"
                    />
                    <span className="text-sm text-neon-purple whitespace-nowrap">
                      {((ticketCounts[raffle.id] || 1) * raffle.ticket_price)} CCTR
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => handlePurchaseTickets(raffle.id)}
                    disabled={purchasing[raffle.id] || raffle.tickets_sold >= raffle.max_tickets}
                    className="w-full cyber-button"
                  >
                    {purchasing[raffle.id] ? (
                      "🎫 Purchasing..."
                    ) : raffle.tickets_sold >= raffle.max_tickets ? (
                      "🚫 SOLD OUT"
                    ) : (
                      "🎫 OPEN CHEST"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {!user ? "Login and connect wallet to open treasure chests" : "Connect your Solana wallet to play"}
                  </p>
                  <Button 
                    onClick={handleLoginToPlay}
                    variant="outline" 
                    size="sm" 
                    className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                  >
                    {!user ? "Login to Play" : "Connect Wallet"}
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
