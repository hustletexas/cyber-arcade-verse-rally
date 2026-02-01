import React, { useEffect } from 'react';
import { useCyberTrivia } from '@/hooks/useCyberTrivia';
import { CyberTriviaHome } from './CyberTriviaHome';
import { CyberTriviaGameplay } from './CyberTriviaGameplay';
import { CyberTriviaResults } from './CyberTriviaResults';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useSorobanContracts } from '@/hooks/useSorobanContracts';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap } from 'lucide-react';

import './cyber-trivia.css';

export const CyberTriviaChallenge: React.FC = () => {
  const trivia = useCyberTrivia();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { getCCTRBalance } = useSorobanContracts();
  const [cctrBalance, setCctrBalance] = React.useState<string>('0.00');

  useEffect(() => {
    trivia.loadUserStats();
    trivia.loadDailyLeaderboard();
    trivia.loadAllTimeLeaderboard();
  }, []);

  // Load CCTR balance when wallet is connected
  useEffect(() => {
    const loadBalance = async () => {
      if (isWalletConnected && primaryWallet?.address) {
        const balance = await getCCTRBalance(primaryWallet.address);
        if (balance) {
          setCctrBalance(balance.formatted);
        }
      }
    };
    loadBalance();
  }, [isWalletConnected, primaryWallet?.address, getCCTRBalance]);

  return (
    <div className="cyber-trivia-container min-h-[600px]">
      {/* Animated background grid */}
      <div className="cyber-grid-bg" />
      
      {/* Wallet Status Bar - Soroban Integration */}
      <div className="relative z-20 mb-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-neon-cyan/20">
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className="border-neon-cyan/50 text-neon-cyan flex items-center gap-1.5 px-3 py-1"
            >
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">Stellar Powered</span>
            </Badge>
            <span className="text-xs text-gray-500">Soroban Smart Contract</span>
          </div>
          
          {isWalletConnected && primaryWallet ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">CCTR:</span>
                <span className="text-sm font-bold text-yellow-400">{cctrBalance}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                <Wallet className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm text-neon-cyan font-mono">
                  {primaryWallet.address.slice(0, 4)}...{primaryWallet.address.slice(-4)}
                </span>
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <Wallet className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400">Connect Wallet to Play</span>
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {trivia.gameState.status === 'idle' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CyberTriviaHome
              onStartFreePlay={(category, playMode) => trivia.startGame('free_play', category)}
              onStartDailyRun={() => trivia.startGame('daily_run')}
              userStats={trivia.userStats}
              dailyLeaderboard={trivia.dailyLeaderboard}
              allTimeLeaderboard={trivia.allTimeLeaderboard}
              loading={trivia.loading}
            />
          </motion.div>
        )}

        {trivia.gameState.status === 'playing' && (
          <motion.div
            key="gameplay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <CyberTriviaGameplay
              gameState={trivia.gameState}
              userStats={trivia.userStats}
              onSelectAnswer={trivia.selectAnswer}
              onSubmitAnswer={trivia.submitAnswer}
              onNextQuestion={trivia.nextQuestion}
              onUseFiftyFifty={trivia.useFiftyFifty}
              onUseExtraTime={trivia.useExtraTime}
              onUseSkip={trivia.useSkip}
              onQuit={trivia.resetGame}
            />
          </motion.div>
        )}

        {trivia.gameState.status === 'finished' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CyberTriviaResults
              gameState={trivia.gameState}
              dailyLeaderboard={trivia.dailyLeaderboard}
              userStats={trivia.userStats}
              onPlayAgain={() => trivia.startGame(trivia.gameState.mode)}
              onBackToMenu={trivia.resetGame}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
