import React from 'react';
import { GameMode, GAME_ENTRY_FEE, MAX_DAILY_PLAYS } from '@/types/cyber-sequence';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Zap, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const canPlayDaily = walletConnected && cctrBalance >= GAME_ENTRY_FEE && dailyPlaysRemaining > 0;
  return <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="absolute top-4 left-4 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          CYBER SEQUENCE
        </h1>
        <p className="text-gray-400">
          Watch. Remember. Repeat.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Play */}
        <div onClick={() => onSelectMode('free')} className="sequence-mode-card sequence-mode-free sequence-glass-panel cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
              <Gamepad2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Free Play</h2>
              <p className="text-sm text-gray-400">Practice Mode</p>
            </div>
          </div>
          
          <ul className="space-y-2 text-sm text-gray-300 mb-4">
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              No entry fee required
            </li>
            <li className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-green-400" />
              Unlimited mistakes
            </li>
            <li className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-green-400" />
              Perfect for practice
            </li>
          </ul>

          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={e => {
          e.stopPropagation();
          onSelectMode('free');
        }}>
            Start Free Play
          </Button>
        </div>

        {/* Daily Run */}
        <div onClick={() => canPlayDaily && onSelectMode('daily')} className={`sequence-mode-card sequence-mode-daily sequence-glass-panel ${!canPlayDaily ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Daily Run</h2>
              <p className="text-sm text-gray-400">Ranked Mode</p>
            </div>
          </div>
          
          <ul className="space-y-2 text-sm text-gray-300 mb-4">
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              {GAME_ENTRY_FEE} CCTR entry fee
            </li>
            <li className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-400" />
              3 lives max
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              Leaderboard + rewards
            </li>
          </ul>

          {!walletConnected ? <p className="text-center text-sm text-yellow-400 mb-2">
              Connect wallet to play
            </p> : cctrBalance < GAME_ENTRY_FEE ? <p className="text-center text-sm text-red-400 mb-2">
              Insufficient CCTR balance
            </p> : dailyPlaysRemaining <= 0 ? <p className="text-center text-sm text-yellow-400 mb-2">
              Daily plays exhausted
            </p> : null}

          <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={!canPlayDaily} onClick={e => {
          e.stopPropagation();
          if (canPlayDaily) onSelectMode('daily');
        }}>
            {walletConnected ? `Play (${dailyPlaysRemaining}/${MAX_DAILY_PLAYS} remaining)` : 'Connect Wallet'}
          </Button>
        </div>
      </div>

      {/* Balance display */}
      {walletConnected && <div className="mt-6 text-center">
          <p className="text-gray-400">
        <span className="text-cyan-400 font-bold">{cctrBalance} CCTR</span>
          </p>
        </div>}

    </div>;
};