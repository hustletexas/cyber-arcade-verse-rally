import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWheelContract } from '@/hooks/useWheelContract';
import { Zap, Star, Trophy, Coins, Gift, Gem } from 'lucide-react';

interface WheelPrize {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  cctrValue: number;
  probability: number;
}

const wheelPrizes: WheelPrize[] = [
  { id: '1', name: '1000 CCTR', icon: <Coins className="w-6 h-6" />, color: '#00ff41', cctrValue: 1000, probability: 0.15 },
  { id: '2', name: '500 CCTR', icon: <Zap className="w-6 h-6" />, color: '#ff0080', cctrValue: 500, probability: 0.2 },
  { id: '3', name: '2000 CCTR', icon: <Trophy className="w-6 h-6" />, color: '#ffaa00', cctrValue: 2000, probability: 0.1 },
  { id: '4', name: '250 CCTR', icon: <Star className="w-6 h-6" />, color: '#0080ff', cctrValue: 250, probability: 0.25 },
  { id: '5', name: '5000 CCTR', icon: <Gem className="w-6 h-6" />, color: '#8000ff', cctrValue: 5000, probability: 0.05 },
  { id: '6', name: '750 CCTR', icon: <Gift className="w-6 h-6" />, color: '#ff4000', cctrValue: 750, probability: 0.15 },
  { id: '7', name: '1500 CCTR', icon: <Coins className="w-6 h-6" />, color: '#00ffff', cctrValue: 1500, probability: 0.1 }
];

const WheelOfGaming: React.FC = () => {
  const { toast } = useToast();
  const { spinWheel: processWheelSpin, isProcessing } = useWheelContract();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [gameStatus, setGameStatus] = useState<'menu' | 'ready' | 'spinning' | 'result'>('menu');
  const [lastPrize, setLastPrize] = useState<WheelPrize | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const segmentAngle = 360 / wheelPrizes.length;

  const getRandomPrize = (): { prize: WheelPrize; angle: number } => {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (let i = 0; i < wheelPrizes.length; i++) {
      cumulativeProbability += wheelPrizes[i].probability;
      if (random <= cumulativeProbability) {
        const targetAngle = (i * segmentAngle) + (segmentAngle / 2);
        return { prize: wheelPrizes[i], angle: targetAngle };
      }
    }
    
    // Fallback
    return { prize: wheelPrizes[0], angle: segmentAngle / 2 };
  };

  const spinWheel = async () => {
    if (isSpinning || isProcessing) return;

    setIsSpinning(true);
    setGameStatus('spinning');
    
    const { prize, angle } = getRandomPrize();
    
    // Calculate spin rotation (multiple full rotations + target angle)
    const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = currentRotation + (fullRotations * 360) + (360 - angle);
    
    setCurrentRotation(finalRotation);

    // Wait for animation to complete
    setTimeout(async () => {
      setLastPrize(prize);
      setGameStatus('result');
      setIsSpinning(false);
      setSpinCount(prev => prev + 1);

      toast({
        title: `🎊 Congratulations!`,
        description: `You won ${prize.name}!`,
      });

      // Process through Solana contract
      await processWheelSpin(prize.cctrValue, prize.name);
    }, 4000);
  };

  const startNewGame = () => {
    setGameStatus('ready');
    setLastPrize(null);
  };

  const resetGame = () => {
    setGameStatus('menu');
    setLastPrize(null);
    setCurrentRotation(0);
    setSpinCount(0);
  };

  if (gameStatus === 'menu') {
    return (
      <Card className="holographic max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl text-neon-cyan flex items-center justify-center gap-3">
            <Zap className="w-10 h-10" />
            WHEEL OF GAMING
            <Zap className="w-10 h-10" />
          </CardTitle>
          <p className="text-xl text-neon-purple mt-2">
            Spin the futuristic wheel to win CCTR tokens!
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Prize Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wheelPrizes.map((prize) => (
              <div key={prize.id} className="text-center p-4 rounded-lg border border-neon-cyan/30 bg-black/40">
                <div className="flex justify-center mb-2" style={{ color: prize.color }}>
                  {prize.icon}
                </div>
                <div className="text-sm font-bold" style={{ color: prize.color }}>
                  {prize.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(prize.probability * 100)}% chance
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              onClick={startNewGame}
              className="cyber-button text-2xl px-12 py-6"
            >
              🎰 START SPINNING
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Game Header */}
      <Card className="holographic">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Zap className="w-5 h-5 mr-2" />
                Wheel of Gaming
              </Badge>
              <div className="text-sm text-muted-foreground">
                Spins: {spinCount}
              </div>
            </div>
            
            <Button 
              onClick={resetGame}
              variant="outline"
              className="cyber-button-secondary"
            >
              🔄 Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wheel Container */}
      <Card className="holographic">
        <CardContent className="p-12">
          <div className="flex flex-col items-center space-y-8">
            {/* Wheel */}
            <div className="relative">
              {/* Pointer */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-6 h-12 bg-neon-cyan rounded-full shadow-[0_0_20px_#00ffff]" 
                     style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
                </div>
              </div>

              {/* Wheel */}
              <div 
                ref={wheelRef}
                className="w-80 h-80 rounded-full relative border-4 border-neon-cyan shadow-[0_0_50px_#00ffff] transition-transform duration-[4000ms] ease-out"
                style={{ 
                  transform: `rotate(${currentRotation}deg)`,
                  background: 'conic-gradient(from 0deg, #000 0deg, #111 360deg)'
                }}
              >
                {wheelPrizes.map((prize, index) => {
                  const rotation = index * segmentAngle;
                  return (
                    <div
                      key={prize.id}
                      className="absolute w-full h-full rounded-full"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        background: `conic-gradient(from 0deg, ${prize.color}20 0deg, ${prize.color}40 ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)}%)`
                      }}
                    >
                      {/* Prize Content */}
                      <div 
                        className="absolute text-white font-bold text-sm flex flex-col items-center justify-center"
                        style={{
                          top: '15%',
                          left: '48%',
                          transform: `rotate(${segmentAngle / 2}deg) translate(-50%, -50%)`,
                          color: prize.color
                        }}
                      >
                        <div className="mb-1">{prize.icon}</div>
                        <div className="text-xs text-center whitespace-nowrap">
                          {prize.name}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center shadow-[0_0_30px_#00ffff]">
                  <Zap className="w-8 h-8 text-black" />
                </div>
              </div>
            </div>

            {/* Spin Button */}
            {gameStatus === 'ready' && (
              <Button 
                onClick={spinWheel}
                disabled={isSpinning || isProcessing}
                className="cyber-button text-2xl px-16 py-6 shadow-[0_0_30px_#00ff41]"
              >
                {isSpinning ? (
                  <>
                    <Zap className="w-6 h-6 mr-2 animate-spin" />
                    SPINNING...
                  </>
                ) : (
                  <>
                    🎰 SPIN THE WHEEL
                  </>
                )}
              </Button>
            )}

            {/* Status */}
            {gameStatus === 'spinning' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-cyan animate-pulse">
                  🎲 Spinning the Wheel of Gaming...
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Good luck, gamer!
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Display */}
      {gameStatus === 'result' && lastPrize && (
        <Card className="holographic border-2 border-neon-cyan">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-4xl font-bold text-neon-cyan">WINNER!</h2>
            
            <div className="flex items-center justify-center gap-4 text-3xl">
              <div style={{ color: lastPrize.color }}>
                {lastPrize.icon}
              </div>
              <span className="font-bold" style={{ color: lastPrize.color }}>
                {lastPrize.name}
              </span>
            </div>

            <p className="text-lg text-neon-purple">
              Your CCTR tokens have been sent to your wallet!
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setGameStatus('ready')}
                className="cyber-button text-xl px-8 py-4"
                disabled={isProcessing}
              >
                🎰 SPIN AGAIN
              </Button>
              
              <Button 
                onClick={resetGame}
                className="cyber-button-secondary text-xl px-8 py-4"
              >
                🏠 MAIN MENU
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WheelOfGaming;
