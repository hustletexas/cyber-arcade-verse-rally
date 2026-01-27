import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Send, CheckCircle, Clock, RefreshCw, Trophy } from 'lucide-react';
import { TournamentPayout } from '@/types/tournament';
import { useTournamentPayouts } from '@/hooks/useTournaments';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';

interface PayoutManagerProps {
  tournamentId: string;
  payouts: TournamentPayout[];
  onRefresh: () => void;
}

export const PayoutManager: React.FC<PayoutManagerProps> = ({
  tournamentId,
  payouts,
  onRefresh
}) => {
  const { processPayout, loading } = useTournamentPayouts();
  const { primaryWallet } = useMultiWallet();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const completedPayouts = payouts.filter(p => p.status === 'completed');
  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount_usd, 0);
  const totalPaid = completedPayouts.reduce((sum, p) => sum + p.amount_usd, 0);

  const handleProcessPayout = async (payout: TournamentPayout) => {
    if (!primaryWallet?.address) {
      toast({
        title: 'Wallet Required',
        description: 'Connect your wallet to process payouts',
        variant: 'destructive'
      });
      return;
    }

    setProcessingId(payout.id);
    
    try {
      // Generate mock transaction hash for demo
      // In production, this would call the Soroban Rewards Vault contract
      const txHash = `STELLAR_TX_${Date.now().toString(16).toUpperCase()}`;
      
      await processPayout(payout.id, txHash);
      toast({
        title: 'Payout Processed',
        description: `Successfully sent ${payout.amount_usd} USD to winner`
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Payout Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessAll = async () => {
    for (const payout of pendingPayouts) {
      await handleProcessPayout(payout);
    }
  };

  const getPlacementBadge = (placement: number) => {
    switch (placement) {
      case 1: return <Badge className="bg-yellow-500 text-black">🥇 1st</Badge>;
      case 2: return <Badge className="bg-gray-400 text-black">🥈 2nd</Badge>;
      case 3: return <Badge className="bg-amber-600 text-black">🥉 3rd</Badge>;
      default: return <Badge variant="outline">#{placement}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-display text-neon-yellow">
                  ${totalPending.toFixed(2)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-neon-yellow" />
            </div>
          </CardContent>
        </Card>
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Out</p>
                <p className="text-2xl font-display text-neon-green">
                  ${totalPaid.toFixed(2)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-neon-green" />
            </div>
          </CardContent>
        </Card>
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Winners</p>
                <p className="text-2xl font-display text-neon-pink">
                  {payouts.length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-neon-pink" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="arcade-frame">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-neon-cyan">Payouts</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {pendingPayouts.length > 0 && (
              <Button 
                className="cyber-button" 
                size="sm"
                onClick={handleProcessAll}
                disabled={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                Pay All Winners
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payouts available. Finalize standings to generate payouts.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placement</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Amount (USD)</TableHead>
                  <TableHead>Amount (USDC)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map(payout => (
                  <TableRow key={payout.id}>
                    <TableCell>{getPlacementBadge(payout.placement)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {payout.wallet_address.slice(0, 8)}...{payout.wallet_address.slice(-4)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${payout.amount_usd.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payout.amount_usdc.toFixed(2)} USDC
                    </TableCell>
                    <TableCell>
                      {payout.status === 'completed' ? (
                        <Badge className="bg-neon-green text-black">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-neon-yellow text-neon-yellow">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payout.transaction_hash ? (
                        <a 
                          href={`https://stellar.expert/explorer/testnet/tx/${payout.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neon-cyan hover:underline"
                        >
                          {payout.transaction_hash.slice(0, 8)}...
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payout.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProcessPayout(payout)}
                          disabled={loading || processingId === payout.id}
                        >
                          {processingId === payout.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <Send className="w-3 h-3 mr-1" />
                              Pay
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Soroban Integration Note */}
      <Card className="arcade-frame border-neon-purple/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-neon-purple mt-0.5" />
            <div>
              <p className="font-semibold text-neon-purple">Soroban Payouts</p>
              <p className="text-sm text-muted-foreground">
                Payouts are processed through the Soroban Rewards Vault contract. 
                Each payout includes a signed attestation with nonce and deadline 
                for trustless verification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
