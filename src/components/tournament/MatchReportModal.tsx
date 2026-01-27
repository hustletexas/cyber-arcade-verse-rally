import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trophy } from 'lucide-react';
import { TournamentMatch } from '@/types/tournament';
import { useTournaments } from '@/hooks/useTournaments';

interface MatchReportModalProps {
  match: TournamentMatch;
  onClose: () => void;
  onSuccess: () => void;
}

export const MatchReportModal: React.FC<MatchReportModalProps> = ({
  match,
  onClose,
  onSuccess
}) => {
  const { reportMatchResult, loading } = useTournaments();
  const [winnerId, setWinnerId] = useState<string>('');
  const [playerAScore, setPlayerAScore] = useState<number>(0);
  const [playerBScore, setPlayerBScore] = useState<number>(0);

  const handleSubmit = async () => {
    if (!winnerId) return;
    
    const winnerWallet = winnerId === match.player_a_id 
      ? match.player_a_wallet 
      : match.player_b_wallet;

    if (!winnerWallet) return;

    const result = await reportMatchResult(
      match.id,
      winnerId,
      winnerWallet,
      playerAScore,
      playerBScore
    );

    if (result) {
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-neon-pink">
            <Trophy className="w-5 h-5" />
            Report Match Result
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <div className="p-4 bg-background/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Round {match.round_number}, Match {match.match_number}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono">
                {match.player_a_wallet?.slice(0, 8)}...
              </span>
              <span className="text-muted-foreground">vs</span>
              <span className="font-mono">
                {match.player_b_wallet?.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Winner Selection */}
          <div className="space-y-3">
            <Label>Select Winner</Label>
            <RadioGroup value={winnerId} onValueChange={setWinnerId}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-neon-green cursor-pointer">
                <RadioGroupItem value={match.player_a_id || ''} id="player_a" />
                <Label htmlFor="player_a" className="cursor-pointer flex-1">
                  Player A: {match.player_a_wallet?.slice(0, 12)}...
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-neon-green cursor-pointer">
                <RadioGroupItem value={match.player_b_id || ''} id="player_b" />
                <Label htmlFor="player_b" className="cursor-pointer flex-1">
                  Player B: {match.player_b_wallet?.slice(0, 12)}...
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Scores (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score_a">Player A Score</Label>
              <Input
                id="score_a"
                type="number"
                min={0}
                value={playerAScore}
                onChange={e => setPlayerAScore(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score_b">Player B Score</Label>
              <Input
                id="score_b"
                type="number"
                min={0}
                value={playerBScore}
                onChange={e => setPlayerBScore(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="cyber-button" 
              onClick={handleSubmit}
              disabled={!winnerId || loading}
            >
              {loading ? 'Submitting...' : 'Submit Result'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
