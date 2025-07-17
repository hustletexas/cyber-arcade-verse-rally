
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Trophy, Truck, Wallet, Package } from 'lucide-react';

interface UserPrize {
  id: string;
  prize: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    prize_type: string;
    contract_address?: string;
    metadata_uri?: string;
  };
  source_type: string;
  source_id: string;
  won_at: string;
  redemption_status: string;
  redeemed_at?: string;
  redemption_transaction_hash?: string;
  wallet_address?: string;
  shipping_address?: string;
}

export const PrizeSection = () => {
  const { user } = useAuth();
  const { isWalletConnected, getConnectedWallet } = useWallet();
  const { toast } = useToast();
  const [userPrizes, setUserPrizes] = useState<UserPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPrize, setProcessingPrize] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [showShippingForm, setShowShippingForm] = useState<string | null>(null);

  const fetchUserPrizes = async () => {
    if (!user) {
      setUserPrizes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_prizes')
        .select(`
          *,
          prize:prizes(*)
        `)
        .eq('user_id', user.id)
        .order('won_at', { ascending: false });

      if (error) {
        console.error('Error fetching user prizes:', error);
        return;
      }

      setUserPrizes(data || []);
    } catch (error) {
      console.error('Error fetching user prizes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPrizes();
  }, [user]);

  const handleRedeemPrize = async (userPrize: UserPrize) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to redeem prizes",
        variant: "destructive",
      });
      return;
    }

    if (!isWalletConnected()) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to redeem prizes",
        variant: "destructive",
      });
      return;
    }

    const connectedWallet = getConnectedWallet();
    if (!connectedWallet) {
      toast({
        title: "Wallet Error",
        description: "Unable to get wallet information",
        variant: "destructive",
      });
      return;
    }

    // For physical prizes, show shipping form
    if (userPrize.prize.prize_type === 'physical') {
      setShowShippingForm(userPrize.id);
      return;
    }

    setProcessingPrize(userPrize.id);

    try {
      const { data, error } = await supabase.functions.invoke('redeem-prize', {
        body: {
          user_prize_id: userPrize.id,
          wallet_address: connectedWallet.address,
          shipping_address: null
        }
      });

      if (error) throw error;

      toast({
        title: "🎉 Prize Redeemed!",
        description: userPrize.prize.prize_type === 'digital' 
          ? `Your ${userPrize.prize.name} NFT has been sent to your wallet`
          : `Your ${userPrize.prize.name} redemption has been processed`,
      });

      // Refresh prizes
      fetchUserPrizes();

    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message || "Unable to process prize redemption",
        variant: "destructive",
      });
    } finally {
      setProcessingPrize(null);
    }
  };

  const handleShippingSubmit = async (userPrize: UserPrize) => {
    if (!shippingAddress.trim()) {
      toast({
        title: "Shipping Address Required",
        description: "Please enter your shipping address",
        variant: "destructive",
      });
      return;
    }

    const connectedWallet = getConnectedWallet();
    if (!connectedWallet) return;

    setProcessingPrize(userPrize.id);

    try {
      const { data, error } = await supabase.functions.invoke('redeem-prize', {
        body: {
          user_prize_id: userPrize.id,
          wallet_address: connectedWallet.address,
          shipping_address: shippingAddress
        }
      });

      if (error) throw error;

      toast({
        title: "🎉 Prize Redemption Initiated!",
        description: `Your ${userPrize.prize.name} will be shipped to the provided address`,
      });

      setShowShippingForm(null);
      setShippingAddress('');
      fetchUserPrizes();

    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message || "Unable to process prize redemption",
        variant: "destructive",
      });
    } finally {
      setProcessingPrize(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-black">Ready to Redeem</Badge>;
      case 'redeemed':
        return <Badge className="bg-green-500 text-black">Redeemed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-black">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500 text-black">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-emerald-500 text-black">Delivered</Badge>;
      default:
        return <Badge className="bg-gray-500 text-black">Unknown</Badge>;
    }
  };

  const getPrizeTypeIcon = (type: string) => {
    switch (type) {
      case 'physical':
        return <Package className="w-4 h-4" />;
      case 'digital':
        return <Gift className="w-4 h-4" />;
      case 'token':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="arcade-frame">
        <CardContent className="p-8 text-center">
          <div className="text-neon-cyan">Loading your prizes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          🏆 YOUR PRIZES
          <Badge className="bg-neon-green text-black animate-pulse">
            {userPrizes.filter(p => p.redemption_status === 'pending').length} Available
          </Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          Prizes you've won from tournaments and raffles - only redeemable by winners!
        </p>
      </CardHeader>
      <CardContent>
        {userPrizes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-neon-cyan mb-2">No Prizes Yet</h3>
            <p className="text-muted-foreground">
              Win tournaments and raffles to earn exclusive prizes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPrizes.map((userPrize) => (
              <Card key={userPrize.id} className="vending-machine hover:scale-105 transition-transform">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 overflow-hidden">
                    <img 
                      src={userPrize.prize.image_url} 
                      alt={userPrize.prize.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-display text-lg font-bold text-neon-pink">
                        {userPrize.prize.name}
                      </h3>
                      <div className="flex items-center gap-1 text-neon-cyan">
                        {getPrizeTypeIcon(userPrize.prize.prize_type)}
                        <span className="text-xs capitalize">{userPrize.prize.prize_type}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Source:</span>
                        <Badge variant="outline" className="text-neon-green">
                          {userPrize.source_type === 'raffle' ? '🎰 Raffle' : '🏆 Tournament'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        {getStatusBadge(userPrize.redemption_status)}
                      </div>
                      {userPrize.redeemed_at && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Redeemed:</span>
                          <span className="text-xs text-neon-cyan">
                            {new Date(userPrize.redeemed_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {showShippingForm === userPrize.id ? (
                      <div className="space-y-3">
                        <Label htmlFor="shipping" className="text-neon-cyan">Shipping Address</Label>
                        <Input
                          id="shipping"
                          placeholder="Enter your shipping address..."
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="bg-black/50 border-neon-purple text-white"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleShippingSubmit(userPrize)}
                            disabled={processingPrize === userPrize.id}
                            className="cyber-button flex-1"
                          >
                            {processingPrize === userPrize.id ? (
                              "⏳ PROCESSING..."
                            ) : (
                              <>
                                <Truck className="w-4 h-4 mr-2" />
                                CONFIRM SHIPPING
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowShippingForm(null)}
                            className="border-neon-cyan text-neon-cyan"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleRedeemPrize(userPrize)}
                        disabled={
                          processingPrize === userPrize.id || 
                          userPrize.redemption_status !== 'pending' ||
                          !user ||
                          !isWalletConnected()
                        }
                        className="cyber-button w-full"
                      >
                        {processingPrize === userPrize.id ? (
                          "⏳ PROCESSING..."
                        ) : userPrize.redemption_status !== 'pending' ? (
                          userPrize.redemption_status === 'redeemed' ? "✅ REDEEMED" :
                          userPrize.redemption_status === 'processing' ? "📦 PROCESSING" :
                          userPrize.redemption_status === 'shipped' ? "🚚 SHIPPED" :
                          "✅ DELIVERED"
                        ) : !user ? (
                          "🔐 LOGIN TO REDEEM"
                        ) : !isWalletConnected() ? (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            CONNECT WALLET
                          </>
                        ) : (
                          userPrize.prize.prize_type === 'physical' ? (
                            <>
                              <Truck className="w-4 h-4 mr-2" />
                              REDEEM & SHIP
                            </>
                          ) : (
                            <>
                              <Gift className="w-4 h-4 mr-2" />
                              REDEEM NFT
                            </>
                          )
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Information Card */}
        <div className="mt-8">
          <Card className="holographic p-6">
            <div className="text-center">
              <h4 className="font-bold text-neon-green mb-2 text-lg">🎯 Prize System</h4>
              <p className="text-muted-foreground mb-2">
                These prizes are exclusively for tournament and raffle winners - they cannot be purchased!
              </p>
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-neon-purple" />
                  <span className="text-neon-purple">Physical prizes require shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-neon-cyan" />
                  <span className="text-neon-cyan">Digital prizes sent to wallet</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
