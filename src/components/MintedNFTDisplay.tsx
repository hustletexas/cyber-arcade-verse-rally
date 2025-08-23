
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Copy } from 'lucide-react';

interface MintedNFT {
  id: string;
  nft_name: string;
  mint_address: string;
  transaction_hash: string;
  metadata: any;
  created_at: string;
}

export const MintedNFTDisplay = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMintedNFTs();
    }
  }, [user]);

  const fetchMintedNFTs = async () => {
    try {
      const { data, error } = await supabase
        .from('nft_mints')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMintedNFTs(data || []);
    } catch (error) {
      console.error('Error fetching minted NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="holographic">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading your NFTs...</div>
        </CardContent>
      </Card>
    );
  }

  if (mintedNFTs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display text-neon-cyan">Your Minted NFTs</h3>
      {mintedNFTs.map((nft) => (
        <Card key={nft.id} className="arcade-frame">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-neon-green">{nft.nft_name}</span>
              <Badge className="bg-neon-cyan text-black">Minted</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={nft.metadata?.image} 
                alt={nft.nft_name}
                className="w-32 h-32 rounded-lg object-cover border-2 border-neon-cyan/30"
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mint Address:</span>
                <div className="flex items-center gap-2">
                  <code className="text-neon-cyan text-xs">
                    {nft.mint_address.slice(0, 8)}...{nft.mint_address.slice(-4)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(nft.mint_address, 'Mint address')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transaction:</span>
                <div className="flex items-center gap-2">
                  <code className="text-neon-purple text-xs">
                    {nft.transaction_hash.slice(0, 8)}...{nft.transaction_hash.slice(-4)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(nft.transaction_hash, 'Transaction hash')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Minted:</span>
                <span className="text-xs">
                  {new Date(nft.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
