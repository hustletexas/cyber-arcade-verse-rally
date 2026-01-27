import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useStellarPayment, ONRAMP_PROVIDERS } from '@/hooks/useStellarPayment';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Wallet, ArrowRight, ExternalLink, CreditCard, Coins, AlertCircle, CheckCircle } from 'lucide-react';
import { CHAINS } from '@/types/wallet';

interface StellarTournamentEntryProps {
  tournamentId: string;
  tournamentName: string;
  entryFeeUSDC: number;
  prizePool: number;
  onEntrySuccess: (transactionHash: string) => void;
  onOpenWalletModal: () => void;
}

export const StellarTournamentEntry: React.FC<StellarTournamentEntryProps> = ({
  tournamentId,
  tournamentName,
  entryFeeUSDC,
  prizePool,
  onEntrySuccess,
  onOpenWalletModal,
}) => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { 
    hasStellarWallet, 
    usdcBalance, 
    isProcessing, 
    payEntryFee, 
    fetchUSDCBalance,
    getOnrampUrl 
  } = useStellarPayment();

  const [activeTab, setActiveTab] = useState<string>('wallet');
  const [hasEnoughBalance, setHasEnoughBalance] = useState(false);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (hasStellarWallet && primaryWallet?.address) {
      fetchUSDCBalance(primaryWallet.address).then(balance => {
        setHasEnoughBalance(balance >= entryFeeUSDC);
      });
    }
  }, [hasStellarWallet, primaryWallet?.address, entryFeeUSDC, fetchUSDCBalance]);

  const handlePayEntry = async () => {
    // Treasury address for tournament entry fees
    const treasuryAddress = 'GCXYZ...TREASURY'; // Replace with actual treasury address
    
    const result = await payEntryFee(tournamentId, entryFeeUSDC, treasuryAddress);
    
    if (result.success && result.transactionHash) {
      onEntrySuccess(result.transactionHash);
    } else {
      toast({
        title: "Entry Failed",
        description: result.error || "Failed to pay entry fee",
        variant: "destructive",
      });
    }
  };

  const handleOnramp = (providerId: string) => {
    const url = getOnrampUrl(providerId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Not connected state
  if (!isWalletConnected) {
    return (
      <Card className="arcade-frame border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="font-display text-lg text-neon-cyan flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Pay Entry Fee
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-cyan/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-neon-cyan" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Connect a Stellar wallet (Freighter or LOBSTR) to pay the entry fee in USDC
            </p>
            <Button 
              onClick={onOpenWalletModal}
              className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
          
          {/* Cross-chain info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Coming from another blockchain?</p>
                <p className="text-xs text-gray-400 mt-1">
                  No problem! You can easily get USDC on Stellar through our onramp partners. 
                  It only takes a few minutes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connected but not Stellar wallet
  if (!hasStellarWallet) {
    return (
      <Card className="arcade-frame border-yellow-500/30">
        <CardHeader>
          <CardTitle className="font-display text-lg text-yellow-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Stellar Wallet Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
            <p className="text-sm text-white">
              Tournament entry fees are paid in <strong>USDC on Stellar</strong> for fast, 
              low-cost transactions. Please connect a Stellar wallet:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <img src="/images/wallets/freighter.png" alt="Freighter" className="w-5 h-5" />
                <span>Freighter</span>
                <Badge className="bg-neon-green/20 text-neon-green text-[10px]">Recommended</Badge>
              </li>
              <li className="flex items-center gap-2">
                <img src="/images/wallets/lobstr.png" alt="LOBSTR" className="w-5 h-5" />
                <span>LOBSTR</span>
              </li>
            </ul>
          </div>
          
          <Button 
            onClick={onOpenWalletModal}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Switch to Stellar Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Stellar wallet connected
  return (
    <Card className="arcade-frame border-neon-green/30">
      <CardHeader>
        <CardTitle className="font-display text-lg text-neon-green flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Entry Fee Payment
          </span>
          <Badge className="bg-neon-cyan/20 text-neon-cyan">
            {CHAINS.stellar.icon} Stellar
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tournament Info */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Tournament</span>
            <span className="text-white font-medium">{tournamentName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Entry Fee</span>
            <span className="text-neon-green font-bold text-lg">{entryFeeUSDC} USDC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Prize Pool</span>
            <span className="text-neon-cyan font-medium">{prizePool} USDC</span>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
          <div className="flex items-center gap-2">
            <img src="/images/wallets/stellar.png" alt="Stellar" className="w-5 h-5" />
            <span className="text-sm text-gray-400">Your USDC Balance</span>
          </div>
          <span className={`font-bold ${hasEnoughBalance ? 'text-neon-green' : 'text-red-400'}`}>
            {usdcBalance !== null ? `${usdcBalance.toFixed(2)} USDC` : 'Loading...'}
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="wallet" className="data-[state=active]:bg-neon-cyan/20">
              Pay with Wallet
            </TabsTrigger>
            <TabsTrigger value="onramp" className="data-[state=active]:bg-neon-purple/20">
              Buy USDC
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallet" className="mt-4">
            {hasEnoughBalance ? (
              <Button 
                onClick={handlePayEntry}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-neon-green to-neon-cyan hover:opacity-90 h-12 text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {entryFeeUSDC} USDC
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-400">
                    Insufficient USDC balance. You need {entryFeeUSDC} USDC but have {usdcBalance?.toFixed(2) || 0} USDC.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab('onramp')}
                  variant="outline"
                  className="w-full border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy USDC
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="onramp" className="mt-4 space-y-3">
            <p className="text-sm text-gray-400 mb-3">
              Buy USDC on Stellar instantly with card or bank transfer:
            </p>
            {ONRAMP_PROVIDERS.map(provider => (
              <Button
                key={provider.id}
                onClick={() => handleOnramp(provider.id)}
                variant="outline"
                className="w-full justify-between border-white/20 hover:bg-white/5 h-auto py-3"
              >
                <div className="text-left">
                  <div className="font-medium text-white">{provider.name}</div>
                  <div className="text-xs text-gray-400">{provider.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neon-cyan">{provider.fees}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </Button>
            ))}
            <p className="text-xs text-gray-500 text-center mt-2">
              After purchasing, your USDC will appear in your wallet automatically.
            </p>
          </TabsContent>
        </Tabs>

        {/* Security note */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Payments are processed on the Stellar network with minimal fees (~0.00001 XLM)
        </p>
      </CardContent>
    </Card>
  );
};
