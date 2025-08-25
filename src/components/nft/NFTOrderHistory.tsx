
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Music, Palette, Sparkles, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface NFTOrder {
  id: string;
  title: string;
  description: string;
  creator_name: string;
  nft_type: 'music' | 'art' | 'hybrid';
  cctr_cost: number;
  status: 'pending' | 'processing' | 'minting' | 'completed' | 'failed';
  mint_address: string | null;
  created_at: string;
}

export const NFTOrderHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<NFTOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nft_creation_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music className="w-4 h-4 text-neon-purple" />;
      case 'art': return <Palette className="w-4 h-4 text-neon-cyan" />;
      case 'hybrid': return <Sparkles className="w-4 h-4 text-neon-yellow" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'minting': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <Card className="arcade-frame">
        <CardContent className="p-8 text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <p className="text-neon-cyan">Loading your NFT orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="arcade-frame">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-bold text-neon-cyan mb-2">No NFT Orders Yet</h3>
          <p className="text-muted-foreground">
            Create your first premium NFT to see it here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="vending-machine">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg text-neon-pink flex items-center gap-2">
                {getTypeIcon(order.nft_type)}
                {order.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  {order.status.toUpperCase()}
                </Badge>
                <Badge className="bg-neon-green text-black">
                  {order.cctr_cost} $CCTR
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-neon-cyan">Creator:</strong> {order.creator_name}
                </p>
                {order.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-neon-cyan">Description:</strong> {order.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  <strong className="text-neon-purple">Created:</strong> {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex flex-col justify-between">
                {order.mint_address && (
                  <div className="mb-2">
                    <p className="text-xs text-neon-green mb-1">Mint Address:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-black/50 p-1 rounded border">
                        {order.mint_address.slice(0, 8)}...{order.mint_address.slice(-4)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(order.mint_address!);
                          toast({
                            title: "Copied!",
                            description: "Mint address copied to clipboard"
                          });
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {order.status === 'completed' && order.mint_address && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                    onClick={() => window.open(`https://explorer.solana.com/address/${order.mint_address}`, '_blank')}
                  >
                    🔍 View on Explorer
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
