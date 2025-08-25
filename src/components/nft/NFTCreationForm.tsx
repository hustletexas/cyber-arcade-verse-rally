
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Sparkles, Music, Palette } from 'lucide-react';

export const NFTCreationForm = () => {
  const { user } = useAuth();
  const { balance, refetch } = useUserBalance();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creator_name: '',
    nft_type: 'music' as 'music' | 'art' | 'hybrid',
    artwork_url: '',
    music_url: ''
  });

  const getPricing = (type: string) => {
    switch (type) {
      case 'music': return 500;
      case 'art': return 500;
      case 'hybrid': return 750;
      default: return 500;
    }
  };

  const currentPrice = getPricing(formData.nft_type);
  const canAfford = balance.cctr_balance >= currentPrice;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create NFTs",
        variant: "destructive"
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${currentPrice} $CCTR to create this NFT type`,
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.creator_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create NFT order
      const { data: order, error: orderError } = await supabase
        .from('nft_creation_orders')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          creator_name: formData.creator_name,
          nft_type: formData.nft_type,
          artwork_url: formData.artwork_url || null,
          music_url: formData.music_url || null,
          cctr_cost: currentPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Deduct CCTR tokens
      const newBalance = balance.cctr_balance - currentPrice;
      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({ cctr_balance: newBalance })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: -currentPrice,
          transaction_type: 'nft_creation',
          description: `NFT Creation: ${formData.title}`,
          nft_order_id: order.id
        });

      if (transactionError) throw transactionError;

      // Reset form
      setFormData({
        title: '',
        description: '',
        creator_name: '',
        nft_type: 'music',
        artwork_url: '',
        music_url: ''
      });

      await refetch();

      toast({
        title: "🎉 NFT Order Created!",
        description: `Your ${formData.nft_type} NFT "${formData.title}" is being processed. You'll be notified when it's minted!`
      });

    } catch (error: any) {
      console.error('NFT creation error:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create NFT order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music className="w-4 h-4" />;
      case 'art': return <Palette className="w-4 h-4" />;
      case 'hybrid': return <Sparkles className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  return (
    <Card className="arcade-frame">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-neon-cyan font-bold">NFT Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your NFT title"
                  className="bg-black/20 border-neon-purple"
                  required
                />
              </div>

              <div>
                <Label htmlFor="creator_name" className="text-neon-cyan font-bold">Creator Name *</Label>
                <Input
                  id="creator_name"
                  value={formData.creator_name}
                  onChange={(e) => handleInputChange('creator_name', e.target.value)}
                  placeholder="Your artist/creator name"
                  className="bg-black/20 border-neon-purple"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nft_type" className="text-neon-cyan font-bold">NFT Type *</Label>
                <Select value={formData.nft_type} onValueChange={(value) => handleInputChange('nft_type', value)}>
                  <SelectTrigger className="bg-black/20 border-neon-purple">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        Music NFT (500 $CCTR)
                      </div>
                    </SelectItem>
                    <SelectItem value="art">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Art NFT (500 $CCTR)
                      </div>
                    </SelectItem>
                    <SelectItem value="hybrid">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Hybrid NFT (750 $CCTR)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="artwork_url" className="text-neon-cyan font-bold">
                  Artwork URL {formData.nft_type !== 'music' && '*'}
                </Label>
                <Input
                  id="artwork_url"
                  value={formData.artwork_url}
                  onChange={(e) => handleInputChange('artwork_url', e.target.value)}
                  placeholder="https://... (image/video URL)"
                  className="bg-black/20 border-neon-purple"
                />
              </div>

              {(formData.nft_type === 'music' || formData.nft_type === 'hybrid') && (
                <div>
                  <Label htmlFor="music_url" className="text-neon-cyan font-bold">Music URL *</Label>
                  <Input
                    id="music_url"
                    value={formData.music_url}
                    onChange={(e) => handleInputChange('music_url', e.target.value)}
                    placeholder="https://... (audio file URL)"
                    className="bg-black/20 border-neon-purple"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="description" className="text-neon-cyan font-bold">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your NFT..."
                  rows={4}
                  className="bg-black/20 border-neon-purple"
                />
              </div>
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4 border border-neon-green/30">
            <h4 className="font-bold text-neon-green mb-3 flex items-center gap-2">
              {getTypeIcon(formData.nft_type)}
              Order Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>NFT Type:</span>
                <Badge className={`${
                  formData.nft_type === 'music' ? 'bg-neon-purple text-white' :
                  formData.nft_type === 'art' ? 'bg-neon-cyan text-black' :
                  'bg-neon-yellow text-black'
                }`}>
                  {formData.nft_type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Cost:</span>
                <span className="text-neon-green font-bold">{currentPrice} $CCTR</span>
              </div>
              <div className="flex justify-between">
                <span>Your Balance:</span>
                <span className={canAfford ? "text-neon-green" : "text-red-500"}>
                  {balance.cctr_balance.toLocaleString()} $CCTR
                </span>
              </div>
              <div className="flex justify-between">
                <span>After Purchase:</span>
                <span className="text-neon-cyan">
                  {(balance.cctr_balance - currentPrice).toLocaleString()} $CCTR
                </span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !canAfford}
            className="w-full cyber-button text-lg py-6"
          >
            {isSubmitting ? (
              "🔄 Creating NFT Order..."
            ) : !canAfford ? (
              "❌ Insufficient $CCTR Balance"
            ) : (
              `✨ CREATE ${formData.nft_type.toUpperCase()} NFT - ${currentPrice} $CCTR`
            )}
          </Button>

          {!canAfford && (
            <div className="text-center">
              <p className="text-sm text-red-400 mb-2">
                You need {(currentPrice - balance.cctr_balance).toLocaleString()} more $CCTR
              </p>
              <Button variant="outline" className="border-neon-cyan text-neon-cyan">
                💰 BUY MORE $CCTR
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
