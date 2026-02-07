import React from 'react';
import { GameMode, GAME_ENTRY_FEE, MAX_DAILY_PLAYS } from '@/types/cyber-sequence';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Trophy, Zap, Heart } from 'lucide-react';

interface CyberSequenceModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
  cctrBalance: number;
  dailyPlaysRemaining?: number;
  walletConnected: boolean;
}

export const CyberSequenceModeSelect: React.FC<CyberSequenceModeSelectProps> = ({
  onSelectMode,
  cctrBalance,
  dailyPlaysRemaining = MAX_DAILY_PLAYS,
  walletConnected
}) => {
  const canPlayDaily = walletConnected && cctrBalance >= GAME_ENTRY_FEE && dailyPlaysRemaining > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Free Play Card */}
      <Card className="cyber-glass p-6 hover:border-purple-500/50 transition-all duration-300 border-purple-500/30 bg-purple-950/20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">FREE PLAY</h2>
          <p className="text-gray-400 text-sm">
            Unlimited plays • Build your streak • Practice mode
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="border-purple-400/50 text-purple-400">
              <Zap className="w-3 h-3 mr-1" /> No Entry Fee
            </Badge>
            <Badge variant="outline" className="border-purple-400/50 text-purple-400">
              <Heart className="w-3 h-3 mr-1" /> Unlimited Lives
            </Badge>
            <Badge variant="outline" className="border-purple-400/50 text-purple-400">
              <Gamepad2 className="w-3 h-3 mr-1" /> Practice
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => onSelectMode('free')}
            className="w-full py-6 text-lg font-bold text-purple-400 border-purple-400/50 bg-transparent hover:bg-purple-400/10"
          >
            PLAY NOW
          </Button>
        </div>
      </Card>

      {/* Daily Run Card */}
      <Card className={`cyber-glass p-6 hover:border-green-500/50 transition-all duration-300 border-green-500/30 bg-green-950/20 ${!canPlayDaily ? 'opacity-60' : ''}`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">DAILY RUN</h2>
          <p className="text-gray-400 text-sm">
            {GAME_ENTRY_FEE} CCC entry • 3 lives • Ranked leaderboard
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="border-green-400/50 text-green-400">
              <Trophy className="w-3 h-3 mr-1" /> Compete Daily
            </Badge>
            <Badge variant="outline" className="border-green-400/50 text-green-400">
              <Heart className="w-3 h-3 mr-1" /> 3 Lives
            </Badge>
            <Badge variant="outline" className="border-green-400/50 text-green-400">
              <Zap className="w-3 h-3 mr-1" /> Rewards
            </Badge>
          </div>

          {!walletConnected ? (
            <p className="text-center text-sm text-yellow-400">Connect wallet to play</p>
          ) : cctrBalance < GAME_ENTRY_FEE ? (
            <p className="text-center text-sm text-red-400">Insufficient CCC balance</p>
          ) : dailyPlaysRemaining <= 0 ? (
            <p className="text-center text-sm text-yellow-400">Daily plays exhausted</p>
          ) : null}

          <Button
            variant="outline"
            disabled={!canPlayDaily}
            onClick={() => { if (canPlayDaily) onSelectMode('daily'); }}
            className="w-full py-6 text-lg font-bold text-green-400 border-green-400/50 bg-transparent hover:bg-green-400/10"
          >
            {walletConnected ? `START DAILY RUN` : 'CONNECT WALLET'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
