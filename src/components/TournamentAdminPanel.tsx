
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TournamentAdminPanelProps {
  isAdmin: boolean;
}

export const TournamentAdminPanel: React.FC<TournamentAdminPanelProps> = ({ isAdmin }) => {
  const { toast } = useToast();
  const [pendingEntries, setPendingEntries] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadPendingEntries();
      loadPayouts();
    }
  }, [isAdmin]);

  const loadPendingEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select(`
          *,
          tournaments (name)
        `)
        .eq('approved', false)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setPendingEntries(data || []);
    } catch (error) {
      console.error('Error loading pending entries:', error);
    }
  };

  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          tournaments (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error('Error loading payouts:', error);
    }
  };

  const approveEntry = async (entryId: string, placement: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('entries')
        .update({ 
          approved: true, 
          placement: placement,
          approved_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Entry Approved",
        description: `Match result approved with placement #${placement}`
      });

      loadPendingEntries();
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectEntry = async (entryId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Entry Rejected",
        description: "Match result has been rejected and removed"
      });

      loadPendingEntries();
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutStatus = async (payoutId: string, status: string, txHash?: string) => {
    setLoading(true);
    try {
      const updateData: any = { status };
      if (txHash) updateData.tx_hash = txHash;

      const { error } = await supabase
        .from('payouts')
        .update(updateData)
        .eq('id', payoutId);

      if (error) throw error;

      toast({
        title: "Payout Updated",
        description: `Payout status updated to ${status}`
      });

      loadPayouts();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update payout status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            🔍 Pending Match Results ({pendingEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingEntries.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No pending approvals</p>
            ) : (
              pendingEntries.map((entry) => (
                <Card key={entry.id} className="holographic p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-neon-pink">{entry.epic_name}</h3>
                        <p className="text-sm text-gray-400">{entry.tournaments?.name}</p>
                      </div>
                      <Badge className="bg-yellow-500 text-black">Pending Review</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Score:</span>
                        <div className="text-neon-cyan font-bold">{entry.score}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Kills:</span>
                        <div className="text-neon-pink font-bold">{entry.kills}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Wallet:</span>
                        <div className="text-neon-green text-xs">
                          {entry.wallet.slice(0, 8)}...{entry.wallet.slice(-4)}
                        </div>
                      </div>
                    </div>

                    {entry.screenshot_url && (
                      <div>
                        <span className="text-gray-400 text-sm">Screenshot:</span>
                        <a 
                          href={entry.screenshot_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-neon-cyan hover:underline text-sm block"
                        >
                          View Screenshot
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Placement (1-5)"
                        min="1"
                        max="5"
                        className="w-32 bg-black/20 border-neon-purple text-white"
                        id={`placement-${entry.id}`}
                      />
                      <Button 
                        onClick={() => {
                          const placementInput = document.getElementById(`placement-${entry.id}`) as HTMLInputElement;
                          const placement = parseInt(placementInput.value);
                          if (placement >= 1 && placement <= 5) {
                            approveEntry(entry.id, placement);
                          } else {
                            toast({
                              title: "Invalid Placement",
                              description: "Please enter a placement between 1-5",
                              variant: "destructive"
                            });
                          }
                        }}
                        disabled={loading}
                        className="bg-neon-green text-black hover:bg-neon-green/80"
                      >
                        ✓ Approve
                      </Button>
                      <Button 
                        onClick={() => rejectEntry(entry.id)}
                        disabled={loading}
                        variant="destructive"
                      >
                        ✗ Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout Management */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-green">
            💰 Payout Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payouts.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No payouts generated yet</p>
            ) : (
              payouts.map((payout) => (
                <Card key={payout.id} className="holographic p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-neon-green">{payout.tournaments?.name}</h3>
                      <p className="text-sm text-gray-400">
                        Placement #{payout.placement} • {payout.payout_percentage}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {payout.wallet.slice(0, 12)}...{payout.wallet.slice(-6)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-neon-cyan">
                        {payout.amount} SOL
                      </div>
                      <Badge className={
                        payout.status === 'completed' ? 'bg-neon-green text-black' :
                        payout.status === 'failed' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black'
                      }>
                        {payout.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  {payout.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        placeholder="Transaction Hash"
                        className="flex-1 bg-black/20 border-neon-green text-white text-xs"
                        id={`tx-hash-${payout.id}`}
                      />
                      <Button 
                        onClick={() => {
                          const txInput = document.getElementById(`tx-hash-${payout.id}`) as HTMLInputElement;
                          updatePayoutStatus(payout.id, 'completed', txInput.value);
                        }}
                        disabled={loading}
                        className="bg-neon-green text-black text-xs"
                      >
                        Mark Paid
                      </Button>
                    </div>
                  )}
                  
                  {payout.tx_hash && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">TX: </span>
                      <span className="text-xs text-neon-cyan">{payout.tx_hash}</span>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
