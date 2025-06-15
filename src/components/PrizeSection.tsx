import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const PrizeSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{ [key: string]: string }>({});
  const [processingPrize, setProcessingPrize] = useState<string | null>(null);

  const prizes = [
    {
      id: 'gaming-pc',
      name: 'Gaming PC RTX 4090',
      value: '$3,000',
      requirement: '10,000 CCTR',
      cctrCost: 10000,
      usdcCost: 450, // $0.045 per CCTR
      solCost: 5.5, // approximate SOL equivalent
      image: '/lovable-uploads/3fc5f3c0-2b28-4cff-acdc-7c3896ee635b.png',
    },
    {
      id: 'ps5',
      name: 'PlayStation 5',
      value: '$500',
      requirement: '5,000 CCTR',
      cctrCost: 5000,
      usdcCost: 225,
      solCost: 2.7,
      image: '/lovable-uploads/8820a165-f5a8-4d8a-b9d4-8dca31666e27.png',
    },
    {
      id: 'vr-headset',
      name: 'Meta Quest 3',
      value: '$800',
      requirement: '7,500 CCTR',
      cctrCost: 7500,
      usdcCost: 337.5,
      solCost: 4.1,
      image: '/lovable-uploads/5fbf2609-10c6-421a-a9dc-34513c43cea0.png',
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-yellow-500';
      case 'Epic': return 'bg-purple-500';
      case 'Rare': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const handleRedeemPrize = async (prize: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to redeem prizes",
        variant: "destructive",
      });
      return;
    }

    const paymentMethod = selectedPaymentMethod[prize.id] || 'cctr';
    setProcessingPrize(prize.id);

    try {
      // Simulate redemption process
      let cost = '';
      switch (paymentMethod) {
        case 'cctr':
          cost = `${prize.cctrCost.toLocaleString()} $CCTR`;
          break;
        case 'usdc':
          cost = `${prize.usdcCost} USDC`;
          break;
        case 'sol':
          cost = `${prize.solCost} SOL`;
          break;
      }

      toast({
        title: "🎉 Prize Redemption Initiated",
        description: `Redeeming ${prize.name} for ${cost}`,
      });

      // Simulate processing time
      setTimeout(() => {
        toast({
          title: "🏆 Prize Redeemed Successfully!",
          description: `Your ${prize.name} will be shipped within 5-7 business days`,
        });
        setProcessingPrize(null);
      }, 2000);

    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Unable to process prize redemption",
        variant: "destructive",
      });
      setProcessingPrize(null);
    }
  };

  const getCostDisplay = (prize: any, paymentMethod: string) => {
    switch (paymentMethod) {
      case 'usdc':
        return `${prize.usdcCost} USDC`;
      case 'sol':
        return `${prize.solCost} SOL`;
      default:
        return `${prize.cctrCost.toLocaleString()} $CCTR`;
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          🏆 PRIZE POOL
          <Badge className="bg-neon-green text-black animate-pulse">LIVE REWARDS</Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          Earn CCTR tokens and redeem them for amazing prizes! Pay with $CCTR, USDC, or SOL.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map((prize) => (
            <Card key={prize.id} className="vending-machine hover:scale-105 transition-transform">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 overflow-hidden">
                  <img 
                    src={prize.image} 
                    alt={prize.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center space-y-4">
                  <h3 className="font-display text-lg font-bold text-neon-pink mb-2">
                    {prize.name}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-neon-green">{prize.value}</p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Select 
                      value={selectedPaymentMethod[prize.id] || 'cctr'} 
                      onValueChange={(value) => setSelectedPaymentMethod(prev => ({ ...prev, [prize.id]: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cctr">💎 Pay with $CCTR</SelectItem>
                        <SelectItem value="usdc">🪙 Pay with USDC</SelectItem>
                        <SelectItem value="sol">☀️ Pay with SOL</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="text-center">
                      <p className="text-sm text-neon-cyan font-bold">
                        Cost: {getCostDisplay(prize, selectedPaymentMethod[prize.id] || 'cctr')}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleRedeemPrize(prize)}
                      disabled={processingPrize === prize.id || !user}
                      className="cyber-button w-full"
                    >
                      {processingPrize === prize.id ? (
                        "⏳ PROCESSING..."
                      ) : !user ? (
                        "🔐 LOGIN TO REDEEM"
                      ) : (
                        "🎁 REDEEM PRIZE"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="holographic p-4">
            <div className="text-center">
              <h4 className="font-bold text-neon-green mb-2">💎 $CCTR Tokens</h4>
              <p className="text-sm text-muted-foreground">
                Use your earned gaming tokens
              </p>
              <p className="text-xs text-neon-cyan mt-1">Standard redemption method</p>
            </div>
          </Card>
          
          <Card className="holographic p-4">
            <div className="text-center">
              <h4 className="font-bold text-neon-purple mb-2">🪙 USDC</h4>
              <p className="text-sm text-muted-foreground">
                Pay with stable cryptocurrency
              </p>
              <p className="text-xs text-neon-cyan mt-1">$0.045 per equivalent $CCTR</p>
            </div>
          </Card>
          
          <Card className="holographic p-4">
            <div className="text-center">
              <h4 className="font-bold text-neon-yellow mb-2">☀️ Solana</h4>
              <p className="text-sm text-muted-foreground">
                Pay with SOL tokens
              </p>
              <p className="text-xs text-neon-cyan mt-1">Current market rate</p>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
