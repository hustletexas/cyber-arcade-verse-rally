
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Trophy, Ticket, Users, Clock } from 'lucide-react';

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
}

export const RaffleSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketCounts, setTicketCounts] = useState<{[key: string]: number}>({});
  const [purchasing, setPurchasing] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Instead of fetching from database, use demo raffles for now
    const demoRaffles: Raffle[] = [
      {
        id: '1',
        title: 'Rare Cyber Punk NFT',
        description: 'Exclusive limited edition NFT with unique artwork',
        prize_type: 'nft',
        prize_name: 'Cyber Punk Hero #001',
        prize_value: 50000, // $500
        prize_image: '',
        ticket_price: 100,
        max_tickets: 1000,
        tickets_sold: 450,
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: '2',
        title: 'Gaming Hardware Bundle',
        description: 'High-end gaming mouse, keyboard, and headset',
        prize_type: 'physical',
        prize_name: 'Pro Gamer Setup',
        prize_value: 120000, // $1200
        prize_image: '',
        ticket_price: 150,
        max_tickets: 800,
        tickets_sold: 320,
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: '3',
        title: '$CCTR Token Jackpot',
        description: 'Win a massive amount of CCTR tokens',
        prize_type: 'token',
        prize_name: '50,000 $CCTR Tokens',
        prize_value: 225000, // $2250
        prize_image: '',
        ticket_price: 200,
        max_tickets: 500,
        tickets_sold: 125,
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: '4',
        title: 'Legendary Arcade NFT',
        description: 'Ultra-rare retro arcade game NFT collectible',
        prize_type: 'nft',
        prize_name: 'Retro Arcade Legend',
        prize_value: 80000, // $800
        prize_image: '',
        ticket_price: 120,
        max_tickets: 1200,
        tickets_sold: 890,
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      }
    ];
    
    setRaffles(demoRaffles);
    setLoading(false);
  }, []);

  const handlePurchaseTickets = async (raffleId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase raffle tickets",
        variant: "destructive",
      });
      return;
    }

    const ticketCount = ticketCounts[raffleId] || 1;
    setPurchasing(prev => ({ ...prev, [raffleId]: true }));

    try {
      // Simulate purchase process
      setTimeout(() => {
        toast({
          title: "🎫 Tickets Purchased!",
          description: `Successfully purchased ${ticketCount} ticket(s). Good luck!`,
        });
        
        // Update local state
        setRaffles(prev => prev.map(raffle => 
          raffle.id === raffleId 
            ? { ...raffle, tickets_sold: raffle.tickets_sold + ticketCount }
            : raffle
        ));
        
        setTicketCounts(prev => ({ ...prev, [raffleId]: 1 }));
        setPurchasing(prev => ({ ...prev, [raffleId]: false }));
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase tickets",
        variant: "destructive",
      });
      setPurchasing(prev => ({ ...prev, [raffleId]: false }));
    }
  };

  const getPrizeIcon = (prizeType: string) => {
    switch (prizeType) {
      case 'nft': return '🖼️';
      case 'physical': return '📦';
      case 'token': return '🪙';
      default: return '🎁';
    }
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
          <div className="text-neon-cyan">Loading raffles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {raffles.map((raffle) => (
          <Card key={raffle.id} className="holographic overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-neon-pink text-black">
                  {getPrizeIcon(raffle.prize_type)} {raffle.prize_type.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
                  <Clock size={12} className="mr-1" />
                  {formatTimeLeft(raffle.end_date)}
                </Badge>
              </div>
              <CardTitle className="text-lg text-neon-cyan">{raffle.title}</CardTitle>
              {raffle.description && (
                <p className="text-sm text-muted-foreground">{raffle.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Prize Details */}
              <div className="bg-black/30 rounded-lg p-4 border border-neon-purple/30">
                <h4 className="font-bold text-neon-green mb-2">🏆 Prize</h4>
                <p className="text-neon-cyan font-semibold">{raffle.prize_name}</p>
                <p className="text-sm text-neon-purple">
                  Value: ${(raffle.prize_value / 100).toFixed(2)}
                </p>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <Ticket className="mx-auto text-neon-pink mb-1" size={20} />
                  <p className="text-neon-pink font-bold">{raffle.ticket_price} $CCTR</p>
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
                  className="bg-gradient-to-r from-neon-pink to-neon-cyan h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(raffle.tickets_sold / raffle.max_tickets) * 100}%` }}
                />
              </div>

              {/* Purchase Section */}
              {user && (
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
                      {((ticketCounts[raffle.id] || 1) * raffle.ticket_price)} $CCTR
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
                      "🎫 BUY TICKETS"
                    )}
                  </Button>
                </div>
              )}

              {!user && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Login required to purchase tickets
                  </p>
                  <Button variant="outline" size="sm" className="border-neon-cyan text-neon-cyan">
                    Login to Participate
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
