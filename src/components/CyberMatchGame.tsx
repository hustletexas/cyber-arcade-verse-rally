import React, { useRef, useEffect } from 'react';
import { useCyberMatch } from '@/hooks/useCyberMatch';
import { CyberMatchGrid, CyberMatchHUD, CyberMatchModeSelect, CyberMatchEndModal, CyberMatchLeaderboard, CyberMatchPlayerStats } from '@/components/games/cyber-match';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Wallet, Zap } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useSorobanContracts } from '@/hooks/useSorobanContracts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import '@/components/games/cyber-match/cyber-match.css';
export const CyberMatchGame: React.FC = () => {
  const {
    gameState,
    canPlay,
    playsRemaining,
    isLoading,
    finalScore,
    ticketsEarned,
    showEndModal,
    setShowEndModal,
    todayLeaderboard,
    allTimeLeaderboard,
    playerStats,
    startGame,
    onCardClick,
    restartGame,
    backToModeSelect,
    isAuthenticated,
    cctrBalance,
    hasEnoughCCTR,
    entryFee,
    gameMode,
    difficulty,
    totalPairs,
    chestEarned,
    screenShake,
    comboPulse
  } = useCyberMatch();
  const {
    primaryWallet,
    isWalletConnected
  } = useMultiWallet();
  const {
    getCCTRBalance
  } = useSorobanContracts();
  const [walletCctrBalance, setWalletCctrBalance] = React.useState<string>('0.00');
  const leaderboardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const loadBalance = async () => {
      if (isWalletConnected && primaryWallet?.address) {
        const balance = await getCCTRBalance(primaryWallet.address);
        if (balance) {
          setWalletCctrBalance(balance.formatted);
        }
      }
    };
    loadBalance();
  }, [isWalletConnected, primaryWallet?.address, getCCTRBalance]);
  const scrollToLeaderboard = () => {
    setShowEndModal(false);
    setTimeout(() => {
      leaderboardRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };
  return <div className="cyber-match-container min-h-[600px]">
      {/* Animated background grid */}
      <div className="cyber-grid-bg" />
      
      <div className="relative z-20">
        {/* Compact Wallet Status Bar */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-neon-cyan/20">
            <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan flex items-center gap-1.5 px-2 py-1">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">Stellar Powered</span>
            </Badge>
            
            {isWalletConnected && primaryWallet ? <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">CCTR:</span>
                  <span className="text-sm font-bold text-yellow-400">{walletCctrBalance}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                  <Wallet className="w-3 h-3 text-neon-cyan" />
                  <span className="text-xs text-neon-cyan font-mono">
                    {primaryWallet.address.slice(0, 4)}...{primaryWallet.address.slice(-4)}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                </div>
              </div> : <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <Wallet className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-orange-400">Connect Wallet</span>
              </div>}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Loading State */}
          {isLoading && <motion.div key="loading" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="text-center py-8">
              <div className="w-10 h-10 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-3" />
              <p className="text-neon-cyan/70 text-sm">Loading...</p>
            </motion.div>}

          {/* Mode Selection */}
          {!isLoading && !gameState.isPlaying && !gameMode && <motion.div key="mode-select" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.3
        }}>
              {/* Hero Section - Compact */}
              <div className="text-center py-4">
                <h2 className="cyber-title font-display sm:text-3xl md:text-4xl text-neon-cyan mb-2 text-7xl" data-text="CYBER MATCH">
                   CYBER MATCH
                </h2>
                <p className="text-sm text-gray-400">
                  Match pairs • Build combos • Earn rewards
                </p>
              </div>

              <CyberMatchModeSelect isAuthenticated={isAuthenticated} hasEnoughCCTR={hasEnoughCCTR} cctrBalance={cctrBalance} canPlay={canPlay} playsRemaining={playsRemaining} onStartGame={startGame} />

              {/* Stats & Leaderboard Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
                <CyberMatchPlayerStats stats={playerStats} />
                <div ref={leaderboardRef}>
                  <CyberMatchLeaderboard todayLeaderboard={todayLeaderboard} allTimeLeaderboard={allTimeLeaderboard} />
                </div>
              </div>
            </motion.div>}

          {/* Game In Progress */}
          {gameState.isPlaying && <motion.div key="game" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className={cn("transition-all duration-100", screenShake && "animate-shake")}>
              <CyberMatchHUD timeSeconds={gameState.timeSeconds} moves={gameState.moves} matchedPairs={gameState.matchedPairs} totalPairs={totalPairs} streak={gameState.streak} comboMultiplier={gameState.comboMultiplier} mistakesRemaining={gameState.mistakesRemaining} mismatches={gameState.mismatches} totalScore={gameState.totalScore} gameMode={gameMode} comboPulse={comboPulse} />

              <div className="flex justify-center mt-4">
                <CyberMatchGrid cards={gameState.cards} onCardClick={onCardClick} isLocked={gameState.isLocked} difficulty={difficulty} screenShake={screenShake} />
              </div>

              <div className="flex justify-center mt-4">
                <Button onClick={backToModeSelect} variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 text-sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Quit Game
                </Button>
              </div>
            </motion.div>}

          {/* Game Complete - show mode select again */}
          {!isLoading && !gameState.isPlaying && gameMode && <motion.div key="complete" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} className="text-center py-6">
              <CyberMatchModeSelect isAuthenticated={isAuthenticated} hasEnoughCCTR={hasEnoughCCTR} cctrBalance={cctrBalance} canPlay={canPlay} playsRemaining={playsRemaining} onStartGame={startGame} />
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* End Modal */}
      <CyberMatchEndModal isOpen={showEndModal} onClose={() => setShowEndModal(false)} gameState={gameState} finalScore={finalScore} ticketsEarned={ticketsEarned} onPlayAgain={restartGame} onViewLeaderboard={scrollToLeaderboard} canPlayAgain={canPlay} gameMode={gameMode} difficulty={difficulty} chestEarned={chestEarned} />
    </div>;
};
export default CyberMatchGame;