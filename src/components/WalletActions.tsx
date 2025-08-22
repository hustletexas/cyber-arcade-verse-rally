
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { Copy, Send, ArrowDownToLine, CreditCard, QrCode } from 'lucide-react';

export const WalletActions = () => {
  const { toast } = useToast();
  const { primaryWallet } = useMultiWallet();
  const { balance } = useUserBalance();
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

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

  const handleBuy = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to buy",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Buy Feature",
      description: "Redirecting to payment processor...",
    });
    // Integration with payment processor would go here
  };

  const handleSend = async () => {
    if (!sendAmount || !recipientAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and recipient address",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(sendAmount) > balance.cctr_balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough $CCTR to send",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction Initiated",
      description: `Sending ${sendAmount} $CCTR to ${recipientAddress.slice(0, 8)}...`,
    });
    // Blockchain transaction would go here
  };

  if (!primaryWallet) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please connect a wallet to access wallet actions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-3 arcade-frame">
          <TabsTrigger value="buy" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
            <CreditCard size={16} className="mr-2" />
            Buy
          </TabsTrigger>
          <TabsTrigger value="send" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
            <Send size={16} className="mr-2" />
            Send
          </TabsTrigger>
          <TabsTrigger value="receive" className="data-[state=active]:bg-neon-purple data-[state=active]:text-black">
            <ArrowDownToLine size={16} className="mr-2" />
            Receive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center gap-2">
                <CreditCard size={20} />
                Buy $CCTR Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="buyAmount" className="text-sm font-medium">
                  Amount (USD)
                </Label>
                <Input
                  id="buyAmount"
                  type="number"
                  placeholder="0.00"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="bg-background/50 border-neon-green"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {buyAmount ? (parseFloat(buyAmount) / 0.045).toFixed(0) : '0'} $CCTR
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Payment Methods</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black">
                    Credit Card
                  </Button>
                  <Button variant="outline" className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black">
                    PayPal
                  </Button>
                </div>
              </div>

              <Button onClick={handleBuy} className="cyber-button w-full">
                Buy $CCTR
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center gap-2">
                <Send size={20} />
                Send Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipientAddress" className="text-sm font-medium">
                  Recipient Address
                </Label>
                <Input
                  id="recipientAddress"
                  type="text"
                  placeholder="Enter wallet address..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="bg-background/50 border-neon-cyan"
                />
              </div>

              <div>
                <Label htmlFor="sendAmount" className="text-sm font-medium">
                  Amount ($CCTR)
                </Label>
                <Input
                  id="sendAmount"
                  type="number"
                  placeholder="0"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-background/50 border-neon-cyan"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {balance.cctr_balance.toLocaleString()} $CCTR
                </p>
              </div>

              <Button onClick={handleSend} className="cyber-button w-full">
                Send Tokens
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receive" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center gap-2">
                <ArrowDownToLine size={20} />
                Receive Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QrCode size={120} className="text-black" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan QR code or copy address below
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Your Wallet Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-neon-purple bg-background/50 px-3 py-2 rounded flex-1 text-sm">
                    {primaryWallet.address}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(primaryWallet.address, 'Wallet address')}
                    className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> Only send Solana-based tokens to this address. 
                  Sending tokens from other networks may result in permanent loss.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
