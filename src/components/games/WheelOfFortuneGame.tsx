
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWheelContract } from '@/hooks/useWheelContract';
import { getRandomPhrase } from '@/data/gamingPhrases';
import { Zap, Star, Trophy, Coins, Gift, Gem, Skull } from 'lucide-react';

interface WheelPrize {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  cctrValue: number;
  type: 'prize' | 'bankrupt';
}

const wheelPrizes: WheelPrize[] = [
  { id: '1', name: '500 CCTR', icon: <Coins className="w-6 h-6" />, color: '#00ff41', cctrValue: 500, type: 'prize' },
  { id: '2', name: '1000 CCTR', icon: <Zap className="w-6 h-6" />, color: '#ff0080', cctrValue: 1000, type: 'prize' },
  { id: '3', name: 'LOSE EVERYTHING', icon: <Skull className="w-6 h-6" />, color: '#ff0000', cctrValue: 0, type: 'bankrupt' },
  { id: '4', name: '750 CCTR', icon: <Star className="w-6 h-6" />, color: '#0080ff', cctrValue: 750, type: 'prize' },
  { id: '5', name: '2000 CCTR', icon: <Trophy className="w-6 h-6" />, color: '#ffaa00', cctrValue: 2000, type: 'prize' },
  { id: '6', name: '250 CCTR', icon: <Gift className="w-6 h-6" />, color: '#ff4000', cctrValue: 250, type: 'prize' },
  { id: '7', name: 'LOSE EVERYTHING', icon: <Skull className="w-6 h-6" />, color: '#ff0000', cctrValue: 0, type: 'bankrupt' },
  { id: '8', name: '1500 CCTR', icon: <Gem className="w-6 h-6" />, color: '#8000ff', cctrValue: 1500, type: 'prize' }
];

const WheelOfFortuneGame: React.FC = () => {
  const { toast } = useToast();
  const { spinWheel: processReward, isProcessing } = useWheelContract();
  
  const [gamePhase, setGamePhase] = useState<'menu' | 'playing' | 'spinning' | 'guessing' | 'complete'>('menu');
  const [currentPhrase, setCurrentPhrase] = useState(getRandomPhrase());
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [bankTotal, setBankTotal] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [highlightedPrize, setHighlightedPrize] = useState<string | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [roundEarnings, setRoundEarnings] = useState<WheelPrize[]>([]);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const segmentAngle = 360 / wheelPrizes.length;
  const maxWrongGuesses = 5;

  const getDisplayPhrase = () => {
    return currentPhrase.phrase
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        if (guessedLetters.includes(char.toUpperCase())) return char;
        if (/[^A-Z]/.test(char.toUpperCase())) return char;
        return '_';
      })
      .join(' ');
  };

  const isPhraseComplete = () => {
    const letters = currentPhrase.phrase.replace(/[^A-Z]/gi, '').toUpperCase();
    return letters.split('').every(letter => guessedLetters.includes(letter));
  };

  const spinWheel = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setHighlightedPrize(null);
    
    // Random spin with multiple rotations
    const spins = 5 + Math.random() * 3;
    const finalAngle = Math.random() * 360;
    const totalRotation = spins * 360 + finalAngle;
    const newRotation = currentRotation + totalRotation;
    
    setCurrentRotation(newRotation);

    // Calculate which prize we land on
    const normalizedAngle = (360 - (newRotation % 360)) % 360;
    const prizeIndex = Math.floor(normalizedAngle / segmentAngle);
    const landedPrize = wheelPrizes[prizeIndex];

    setTimeout(() => {
      setHighlightedPrize(landedPrize.id);
      
      if (landedPrize.type === 'bankrupt') {
        setBankTotal(0);
        setRoundEarnings([]);
        toast({
          title: "💀 BANKRUPT!",
          description: "You lost everything! Spin again to rebuild your winnings.",
          variant: "destructive",
        });
      } else {
        setBankTotal(prev => prev + landedPrize.cctrValue);
        setRoundEarnings(prev => [...prev, landedPrize]);
        toast({
          title: `🎊 You landed on ${landedPrize.name}!`,
          description: `Total banked: ${bankTotal + landedPrize.cctrValue} CCTR`,
        });
      }
      
      setIsSpinning(false);
      setGamePhase('guessing');
    }, 4000);
  };

  const guessLetter = () => {
    if (!currentGuess || currentGuess.length !== 1) return;
    
    const letter = currentGuess.toUpperCase();
    if (guessedLetters.includes(letter)) {
      toast({
        title: "Already Guessed",
        description: "You've already guessed that letter!",
        variant: "destructive",
      });
      return;
    }

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    setCurrentGuess('');

    if (!currentPhrase.phrase.toUpperCase().includes(letter)) {
      setWrongGuesses(prev => prev + 1);
      toast({
        title: "Wrong Letter",
        description: `"${letter}" is not in the phrase. ${maxWrongGuesses - wrongGuesses - 1} guesses remaining.`,
        variant: "destructive",
      });

      if (wrongGuesses + 1 >= maxWrongGuesses) {
        endGame(false);
        return;
      }
    } else {
      toast({
        title: "Correct!",
        description: `"${letter}" is in the phrase!`,
      });
    }

    // Check if phrase is complete
    const letters = currentPhrase.phrase.replace(/[^A-Z]/gi, '').toUpperCase();
    const isComplete = letters.split('').every(l => newGuessedLetters.includes(l));
    
    if (isComplete) {
      endGame(true);
    }
  };

  const solvePuzzle = () => {
    const solution = currentGuess.toUpperCase().trim();
    if (solution === currentPhrase.phrase.toUpperCase()) {
      endGame(true);
    } else {
      setWrongGuesses(prev => prev + 1);
      toast({
        title: "Wrong Solution",
        description: `That's not correct. ${maxWrongGuesses - wrongGuesses - 1} guesses remaining.`,
        variant: "destructive",
      });
      
      if (wrongGuesses + 1 >= maxWrongGuesses) {
        endGame(false);
      }
    }
    setCurrentGuess('');
  };

  const endGame = async (won: boolean) => {
    setGamePhase('complete');
    
    if (won && bankTotal > 0) {
      toast({
        title: "🎊 CONGRATULATIONS!",
        description: `You solved the phrase and won ${bankTotal} CCTR tokens!`,
        duration: 5000,
      });

      // Process rewards through Solana contract
      await processReward(bankTotal, `Wheel of Fortune - ${currentPhrase.category}`);
    } else {
      toast({
        title: won ? "Puzzle Solved!" : "Game Over",
        description: won ? "But you had no tokens banked!" : `The phrase was: "${currentPhrase.phrase}"`,
        variant: won ? "default" : "destructive",
      });
    }
  };

  const startNewGame = () => {
    setGamePhase('playing');
    setCurrentPhrase(getRandomPhrase());
    setGuessedLetters([]);
    setCurrentGuess('');
    setBankTotal(0);
    setWrongGuesses(0);
    setRoundEarnings([]);
    setHighlightedPrize(null);
  };

  const resetToMenu = () => {
    setGamePhase('menu');
    setCurrentPhrase(getRandomPhrase());
    setGuessedLetters([]);
    setCurrentGuess('');
    setBankTotal(0);
    setWrongGuesses(0);
    setRoundEarnings([]);
    setHighlightedPrize(null);
    setCurrentRotation(0);
  };

  if (gamePhase === 'menu') {
    return (
      <Card className="holographic max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl text-neon-cyan flex items-center justify-center gap-3">
            <Zap className="w-10 h-10" />
            WHEEL OF FORTUNE
            <Zap className="w-10 h-10" />
          </CardTitle>
          <p className="text-xl text-neon-purple mt-2">
            Spin the wheel, collect prizes, solve gaming phrases!
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-neon-cyan">How to Play:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <p className="text-neon-purple">🎰 <strong>Spin the Wheel:</strong> Land on prizes to build your bank</p>
                <p className="text-neon-purple">💀 <strong>Avoid Bankrupt:</strong> Lose everything and start over</p>
                <p className="text-neon-purple">🎮 <strong>Guess Letters:</strong> Reveal the gaming phrase</p>
              </div>
              <div className="space-y-2">
                <p className="text-neon-purple">🧩 <strong>Solve the Puzzle:</strong> Complete the phrase to win</p>
                <p className="text-neon-purple">🎊 <strong>Win Your Bank:</strong> Get all your collected CCTR tokens</p>
                <p className="text-neon-purple">⚡ <strong>5 Wrong Guesses:</strong> Game over!</p>
              </div>
            </div>
            
            <Button 
              onClick={startNewGame}
              className="cyber-button text-2xl px-12 py-6 mt-8"
            >
              🎰 START GAME
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <Card className="holographic">
        <CardContent className="p-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Zap className="w-5 h-5 mr-2" />
                Wheel of Fortune
              </Badge>
              <div className="text-sm space-x-4">
                <span className="text-neon-cyan">Bank: {bankTotal} CCTR</span>
                <span className="text-neon-purple">Wrong: {wrongGuesses}/{maxWrongGuesses}</span>
              </div>
            </div>
            
            <Button 
              onClick={resetToMenu}
              variant="outline"
              className="cyber-button-secondary"
            >
              🏠 Menu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wheel */}
      <Card className="holographic">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {/* Pointer */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
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
                }}
              >
                {wheelPrizes.map((prize, index) => {
                  const rotation = index * segmentAngle;
                  const isHighlighted = highlightedPrize === prize.id;
                  
                  return (
                    <div
                      key={prize.id}
                      className={`absolute w-full h-full rounded-full ${isHighlighted ? 'shadow-[0_0_30px_#00ffff]' : ''}`}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        background: `conic-gradient(from 0deg, ${prize.color}40 0deg, ${prize.color}60 ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)}%)`
                      }}
                    >
                      <div 
                        className="absolute text-white font-bold text-xs flex flex-col items-center justify-center"
                        style={{
                          top: '20%',
                          left: '48%',
                          transform: `rotate(${segmentAngle / 2}deg) translate(-50%, -50%)`,
                          color: prize.color
                        }}
                      >
                        <div className="mb-1">{prize.icon}</div>
                        <div className="text-center whitespace-nowrap text-xs">
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

            {gamePhase === 'playing' && (
              <Button 
                onClick={spinWheel}
                disabled={isSpinning}
                className="cyber-button text-xl px-12 py-4"
              >
                {isSpinning ? (
                  <>
                    <Zap className="w-6 h-6 mr-2 animate-spin" />
                    SPINNING...
                  </>
                ) : (
                  '🎰 SPIN THE WHEEL'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phrase Display */}
      {gamePhase !== 'playing' && (
        <Card className="holographic">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-sm text-neon-purple">
                Category: {currentPhrase.category}
                {currentPhrase.hint && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Hint: {currentPhrase.hint}
                  </div>
                )}
              </div>
              
              <div className="text-4xl font-mono font-bold text-neon-cyan tracking-widest">
                {getDisplayPhrase()}
              </div>

              {guessedLetters.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Guessed Letters: {guessedLetters.join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guess Interface */}
      {gamePhase === 'guessing' && (
        <Card className="holographic">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Input
                type="text"
                placeholder="Enter letter or full solution"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                className="text-center text-lg max-w-xs"
                onKeyPress={(e) => e.key === 'Enter' && (currentGuess.length === 1 ? guessLetter() : solvePuzzle())}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={guessLetter}
                  disabled={!currentGuess || currentGuess.length !== 1}
                  className="cyber-button"
                >
                  Guess Letter
                </Button>
                
                <Button 
                  onClick={solvePuzzle}
                  disabled={!currentGuess || currentGuess.length <= 1}
                  variant="outline"
                  className="cyber-button-secondary"
                >
                  Solve Puzzle
                </Button>
                
                <Button 
                  onClick={spinWheel}
                  disabled={isSpinning}
                  className="cyber-button text-sm px-4"
                >
                  Spin Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Complete */}
      {gamePhase === 'complete' && (
        <Card className="holographic border-2 border-neon-cyan">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl mb-4">
              {isPhraseComplete() && bankTotal > 0 ? '🎊' : '😔'}
            </div>
            
            <h2 className="text-4xl font-bold text-neon-cyan">
              {isPhraseComplete() && bankTotal > 0 ? 'WINNER!' : 'GAME OVER'}
            </h2>
            
            <div className="text-xl text-neon-purple">
              The phrase was: <span className="text-neon-cyan font-bold">"{currentPhrase.phrase}"</span>
            </div>

            {bankTotal > 0 && isPhraseComplete() && (
              <div className="text-2xl text-neon-cyan font-bold">
                You won {bankTotal} CCTR tokens!
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={startNewGame}
                className="cyber-button text-xl px-8 py-4"
              >
                🎮 PLAY AGAIN
              </Button>
              
              <Button 
                onClick={resetToMenu}
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

export default WheelOfFortuneGame;
