import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, DollarSign, Coins } from 'lucide-react';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { WalletStatusBar } from '@/components/WalletStatusBar';

export const TokenPurchase = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected, connectWallet } = useMultiWallet();
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<string>('usdc');
  const [processing, setProcessing] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const tokenPrice = 0.045; // $0.045 per CCTR token

  const handleWalletConnect = async () => {
    if (!isWalletConnected) {
      // Try to connect to Phantom automatically first
      if (window.solana && window.solana.isPhantom) {
        try {
          const response = await window.solana.connect();
          const address = response.publicKey.toString();
          await connectWallet('phantom', address);
          
          toast({
            title: "🎉 Phantom Connected!",
            description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
          });
        } catch (error) {
          console.error('Failed to connect Phantom:', error);
          setShowWalletModal(true);
        }
      } else {
        setShowWalletModal(true);
      }
    }
  };

  const handleWalletConnected = (walletType: string, address: string) => {
    connectWallet(walletType as any, address);
    setShowWalletModal(false);
  };

  const handlePurchase = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to purchase tokens",
        variant: "destructive"
      });
      await handleWalletConnect();
      return;
    }

    setProcessing(true);
    try {
      // Handle crypto payments only (removed fiat handling)
      await handleCryptoPurchase();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCryptoPurchase = async () => {
    if (!primaryWallet) {
      throw new Error("No wallet connected");
    }

    // Simulate crypto purchase flow
    toast({
      title: "🔗 Preparing Crypto Transaction",
      description: `Preparing to purchase ${amount.toLocaleString()} $CCTR tokens with ${paymentMethod.toUpperCase()}`,
    });

    // In a real implementation, this would:
    // 1. Create a transaction on the blockchain
    // 2. Request user signature
    // 3. Submit to network
    // 4. Wait for confirmation
    // 5. Update user balance

    // For now, simulate the process
    await new Promise(resolve => setTimeout(resolve, 3000));

    toast({
      title: "🎉 Purchase Successful!",
      description: `Successfully purchased ${amount.toLocaleString()} $CCTR tokens`,
    });
  };

  const handleFiatPurchase = async () => {
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: {
        amount: amount,
        payment_method: paymentMethod,
        payment_currency: getPaymentCurrency(paymentMethod),
        token_amount: amount,
        wallet_address: primaryWallet?.address
      }
    });

    if (error) throw error;

    // Open payment URL in new tab
    if (data.payment_url) {
      window.open(data.payment_url, '_blank');
    }

    toast({
      title: "💳 Payment Initiated",
      description: `Redirecting to ${paymentMethod.toUpperCase()} for ${amount.toLocaleString()} $CCTR tokens`
    });
  };

  const getPaymentCurrency = (method: string) => {
    switch (method) {
      case 'usdc':
        return 'USDC';
      case 'pyusd':
        return 'PYUSD';
      case 'solana':
        return 'SOL';
      default:
        return 'USD';
    }
  };

  const paymentMethods = [{
    value: 'cctr',
    label: '🎮 CCTR',
    icon: '🎮'
  }, {
    value: 'usdc',
    label: '🪙 USDC',
    icon: '🪙'
  }, {
    value: 'pyusd',
    label: '💰 PYUSD',
    icon: '💰'
  }];
  const presetAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <>
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-green flex items-center gap-3">
            💰 BUY $CCTR TOKENS
            <Badge className="bg-neon-cyan text-black">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Wallet Connection Status */}
          <div className="mb-6">
            <WalletStatusBar />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card className="holographic p-6">
                <h3 className="font-display text-xl text-neon-cyan mb-4">📊 TOKENOMICS</h3>
                <div className="space-y-4">
                  <div className="border-b border-neon-purple/30 pb-3">
                    <h4 className="font-bold text-neon-pink mb-2">Total Supply</h4>
                    <p className="text-2xl font-bold text-neon-green">1,000,000,000 $CCTR</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Public Sale:</span>
                      <span className="text-neon-green font-bold">40% (400M)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Gaming Rewards:</span>
                      <span className="text-neon-cyan font-bold">25% (250M)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Team & Dev:</span>
                      <span className="text-neon-purple font-bold">15% (150M)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Liquidity:</span>
                      <span className="text-neon-pink font-bold">10% (100M)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Marketing:</span>
                      <span className="text-neon-yellow font-bold">10% (100M)</span>
                    </div>
                  </div>

                  <div className="border-t border-neon-cyan/30 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Current Price:</span>
                      <span className="text-neon-green font-bold">${tokenPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Market Cap:</span>
                      <span className="text-neon-cyan font-bold">$45,000,000</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="vending-machine p-6">
                <h3 className="font-display text-xl text-neon-pink mb-4">🔥 Token Utility</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-neon-green">⚡</span>
                    <span className="text-sm">Tournament Entry Fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neon-cyan">🎫</span>
                    <span className="text-sm">Raffle Participation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neon-purple">🛒</span>
                    <span className="text-sm">NFT Marketplace Trading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neon-pink">💎</span>
                    <span className="text-sm">Staking Rewards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neon-yellow">🗳️</span>
                    <span className="text-sm">Governance Voting</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="bg-black/30 rounded-lg p-6 border border-neon-purple/30">
                <h3 className="font-bold text-neon-cyan mb-4">📊 Token Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Token Price:</span>
                    <span className="text-neon-green font-bold">${tokenPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="text-neon-purple font-bold">Solana</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract:</span>
                    <span className="text-neon-cyan font-mono text-xs">CCTR...xyz</span>
                  </div>
                  {isWalletConnected && (
                    <div className="flex justify-between">
                      <span>Connected:</span>
                      <span className="text-neon-green font-mono text-xs">
                        {primaryWallet?.address.slice(0, 8)}...{primaryWallet?.address.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-neon-pink">Amount to Purchase</h3>
                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map(preset => (
                    <Button 
                      key={preset} 
                      variant={amount === preset ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setAmount(preset)} 
                      className={amount === preset ? "cyber-button" : "border-neon-cyan text-neon-cyan"}
                    >
                      {preset.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <Input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(parseInt(e.target.value) || 0)} 
                  placeholder="Custom amount" 
                  min="1" 
                  className="text-center text-lg font-bold" 
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-neon-pink">Payment Method</h3>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usdc">🪙 USDC</SelectItem>
                    <SelectItem value="pyusd">💰 PYUSD</SelectItem>
                    <SelectItem value="solana">⚡ Solana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-black/50 rounded-lg p-4 border border-neon-green/30">
                <h4 className="font-bold text-neon-green mb-3">💰 Purchase Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tokens:</span>
                    <span className="text-neon-cyan font-bold">{amount.toLocaleString()} $CCTR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="text-neon-green font-bold">
                      ${(amount * tokenPrice).toFixed(2)} {getPaymentCurrency(paymentMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Gas Fees:</span>
                    <span>Included</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={!isWalletConnected ? handleWalletConnect : handlePurchase}
                disabled={processing || !amount}
                className="w-full cyber-button text-lg py-6"
              >
                {processing ? (
                  "💳 Processing..."
                ) : !isWalletConnected ? (
                  "🔗 CONNECT PHANTOM WALLET"
                ) : (
                  `💰 BUY ${amount.toLocaleString()} $CCTR`
                )}
              </Button>
            </div>

            <div className="space-y-6">
              <Card className="vending-machine p-6">
                <h3 className="font-display text-xl text-neon-cyan mb-4">💡 Why Buy $CCTR?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-neon-green text-xl">🎮</span>
                    <div>
                      <h4 className="font-bold text-neon-pink">Tournament Entry</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter exclusive gaming tournaments with $CCTR entry fees
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-neon-purple text-xl">🎫</span>
                    <div>
                      <h4 className="font-bold text-neon-pink">Raffle Tickets</h4>
                      <p className="text-sm text-muted-foreground">
                        Purchase raffle tickets for exclusive prizes and NFTs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-neon-cyan text-xl">🛒</span>
                    <div>
                      <h4 className="font-bold text-neon-pink">Marketplace</h4>
                      <p className="text-sm text-muted-foreground">
                        Buy and sell NFTs and in-game items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-neon-pink text-xl">💎</span>
                    <div>
                      <h4 className="font-bold text-neon-pink">Staking Rewards</h4>
                      <p className="text-sm text-muted-foreground">
                        Stake $CCTR to earn passive rewards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-neon-yellow text-xl">🏆</span>
                    <div>
                      <h4 className="font-bold text-neon-pink">Loyalty Rewards</h4>
                      <p className="text-sm text-muted-foreground">
                        Earn bonus tokens and exclusive perks for loyalty
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-neon-purple text-xl">👑</span>
                    <div>
                      <h4 className="font-bold text-neon-pink">VIP Access</h4>
                      <p className="text-sm text-muted-foreground">
                        Exclusive access to premium features and events
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="holographic p-6">
                <h3 className="font-display text-xl text-neon-pink mb-4">🔒 Security Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-neon-green">✅</span>
                    <span className="text-sm">Secure PayPal Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neon-green">✅</span>
                    <span className="text-sm">Multi-Currency Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neon-green">✅</span>
                    <span className="text-sm">Instant Token Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neon-green">✅</span>
                    <span className="text-sm">24/7 Customer Support</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={handleWalletConnected}
      />
    </>
  );
};
