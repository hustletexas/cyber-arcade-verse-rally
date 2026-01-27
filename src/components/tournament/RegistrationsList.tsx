import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Shield, RefreshCw } from 'lucide-react';
import { TournamentRegistration } from '@/types/tournament';
import { useTournamentRegistrations } from '@/hooks/useTournaments';

interface RegistrationsListProps {
  tournamentId: string;
  registrations: TournamentRegistration[];
  onRefresh: () => void;
}

export const RegistrationsList: React.FC<RegistrationsListProps> = ({ 
  tournamentId,
  registrations,
  onRefresh 
}) => {
  const { checkIn, loading } = useTournamentRegistrations();

  const handleCheckIn = async (registrationId: string) => {
    await checkIn(registrationId);
    onRefresh();
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-neon-green text-black">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-neon-yellow text-neon-yellow">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-neon-cyan">Registrations</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No registrations yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seed</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Pass</TableHead>
                <TableHead>Checked In</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg, index) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-mono">
                    {reg.seed_number || index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {reg.wallet_address.slice(0, 8)}...{reg.wallet_address.slice(-4)}
                  </TableCell>
                  <TableCell>{getPaymentBadge(reg.payment_status)}</TableCell>
                  <TableCell>
                    {reg.pass_verified ? (
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-neon-purple" />
                        <span className="text-sm capitalize">{reg.pass_tier || 'Verified'}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {reg.checked_in ? (
                      <CheckCircle className="w-5 h-5 text-neon-green" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(reg.registered_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {!reg.checked_in && reg.payment_status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCheckIn(reg.id)}
                        disabled={loading}
                      >
                        Check In
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
  );
};
