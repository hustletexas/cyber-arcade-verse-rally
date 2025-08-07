
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSolanaScore } from '@/hooks/useSolanaScore';
import { getRandomPhrase, GamePhrase } from '@/data/gamingPhrases';
import { Trophy, Star, Zap, RotateCcw } from 'lucide-react';

const WheelOfFortuneGame: React.FC = () => {
  const { toast } = useToast();
  const { submitScore, isSubmitting } = useSolanaScore();
  
  const [currentPhrase, setCurrentPhrase] = useState<GamePhrase | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'menu'>('menu');
  const [score, setScore] = useState(0);
  const [letterInput, setLetterInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [gameStarted, setGameStarted] = useState(false);

  const maxWrongGuesses = 6;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && gameStatus === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameStatus('lost');
            toast({
              title: "Time's Up! ⏰",
              description: "You ran out of time!",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameStarted, gameStatus, timeLeft, toast]);

  const startNewGame = () => {
    const phrase = getRandomPhrase();
    setCurrentPhrase(phrase);
    setGuessedLetters(new Set());
    setWrongGuesses([]);
    setGameStatus('playing');
    setScore(0);
    setLetterInput('');
    setTimeLeft(300);
    setGameStarted(true);

    toast({
      title: "New Game Started! 🎮",
      description: `Category: ${phrase.category}`,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayPhrase = (): string => {
    if (!currentPhrase) return '';
    
    return currentPhrase.phrase
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        if (!/[A-Z]/.test(char)) return char; // Show non-letters (numbers, punctuation)
        return guessedLetters.has(char) ? char : '_';
      })
      .join(' ');
  };

  const checkWin = (): boolean => {
    if (!currentPhrase) return false;
    
    const lettersInPhrase = currentPhrase.phrase
      .split('')
      .filter(char => /[A-Z]/.test(char));
    
    return lettersInPhrase.every(letter => guessedLetters.has(letter));
  };

  const guessLetter = () => {
    if (!letterInput || !currentPhrase || gameStatus !== 'playing') return;
    
    const letter = letterInput.toUpperCase();
    
    // Validate input
    if (!/[A-Z]/.test(letter)) {
      toast({
        title: "Invalid Letter",
        description: "Please enter a valid letter A-Z",
        variant: "destructive",
      });
      setLetterInput('');
      return;
    }

    if (guessedLetters.has(letter)) {
      toast({
        title: "Already Guessed",
        description: `You already guessed "${letter}"`,
        variant: "destructive",
      });
      setLetterInput('');
      return;
    }

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (currentPhrase.phrase.includes(letter)) {
      // Correct guess
      const letterCount = (currentPhrase.phrase.match(new RegExp(letter, 'g')) || []).length;
      const points = letterCount * 100;
      setScore(prev => prev + points);
      
      toast({
        title: "Correct! 🎉",
        description: `Found ${letterCount} "${letter}"${letterCount > 1 ? 's' : ''} - ${points} points!`,
      });

      // Check for win
      const lettersInPhrase = currentPhrase.phrase
        .split('')
        .filter(char => /[A-Z]/.test(char));
      
      if (lettersInPhrase.every(char => newGuessedLetters.has(char))) {
        const timeBonus = Math.floor(timeLeft * 2);
        const finalScore = score + points + timeBonus;
        setScore(finalScore);
        setGameStatus('won');
        
        toast({
          title: "Puzzle Solved! 🏆",
          description: `Final Score: ${finalScore} (Time Bonus: ${timeBonus})`,
        });

        // Submit score to Solana
        submitScore(finalScore, 'wheel-of-fortune');
      }
    } else {
      // Wrong guess
      const newWrongGuesses = [...wrongGuesses, letter];
      setWrongGuesses(newWrongGuesses);
      
      toast({
        title: "Wrong Letter! ❌",
        description: `"${letter}" is not in the phrase`,
        variant: "destructive",
      });

      if (newWrongGuesses.length >= maxWrongGuesses) {
        setGameStatus('lost');
        toast({
          title: "Game Over! 💀",
          description: `The phrase was: "${currentPhrase.phrase}"`,
          variant: "destructive",
        });
      }
    }

    setLetterInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      guessLetter();
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  if (gameStatus === 'menu') {
    return (
      <Card className="holographic max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-neon-cyan flex items-center justify-center gap-2">
            <Star className="w-8 h-8" />
            Wheel of Fortune
            <Star className="w-8 h-8" />
          </CardTitle>
          <p className="text-neon-purple text-lg">
            Guess the gaming phrase to win CCTR tokens!
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <h3 className="font-bold text-neon-cyan">How to Play:</h3>
              <ul className="text-sm space-y-1">
                <li>• Guess letters to reveal the gaming phrase</li>
                <li>• Each correct letter earns 100 points</li>
                <li>• You have 6 wrong guesses maximum</li>
                <li>• Complete the puzzle within 5 minutes</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-neon-purple">Rewards:</h3>
              <ul className="text-sm space-y-1">
                <li>• 100 points per correct letter</li>
                <li>• Time bonus for fast completion</li>
                <li>• CCTR tokens for winning</li>
                <li>• Categories: Games, Characters, Terms</li>
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={startNewGame}
            className="cyber-button text-xl px-8 py-4"
          >
            🎰 START GAME
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <Card className="holographic">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {currentPhrase?.category}
              </Badge>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-neon-cyan" />
                <span className="text-xl font-bold">{score.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Time Left</div>
                <Badge variant={timeLeft <= 60 ? "destructive" : "default"}>
                  {formatTime(timeLeft)}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Wrong Guesses</div>
                <Badge variant={wrongGuesses.length >= 4 ? "destructive" : "secondary"}>
                  {wrongGuesses.length}/{maxWrongGuesses}
                </Badge>
              </div>
            </div>
          </div>
          
          <Progress 
            value={(timeLeft / 300) * 100} 
            className="mt-4 h-2"
          />
        </CardContent>
      </Card>

      {/* Main Game Area */}
      <Card className="holographic">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Phrase Display */}
            <div className="bg-black/50 p-6 rounded-lg border border-neon-cyan/30">
              <div className="text-3xl md:text-4xl font-mono font-bold text-neon-cyan tracking-wider">
                {displayPhrase()}
              </div>
              {currentPhrase?.hint && (
                <div className="mt-4 text-neon-purple">
                  <strong>Hint:</strong> {currentPhrase.hint}
                </div>
              )}
            </div>

            {/* Letter Input */}
            {gameStatus === 'playing' && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={letterInput}
                    onChange={(e) => setLetterInput(e.target.value.slice(0, 1))}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a letter"
                    className="w-20 text-center text-xl font-bold uppercase"
                    maxLength={1}
                  />
                  <Button onClick={guessLetter} disabled={!letterInput}>
                    Guess Letter
                  </Button>
                </div>
              </div>
            )}

            {/* Alphabet Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-neon-purple">Letters:</h3>
              <div className="grid grid-cols-13 gap-2 max-w-3xl mx-auto">
                {alphabet.map(letter => (
                  <div
                    key={letter}
                    className={`
                      w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-bold
                      ${guessedLetters.has(letter) 
                        ? currentPhrase?.phrase.includes(letter)
                          ? 'bg-green-500/50 border-green-400 text-green-100'
                          : 'bg-red-500/50 border-red-400 text-red-100'
                        : 'border-muted-foreground/30 text-muted-foreground'
                      }
                    `}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>

            {/* Wrong Letters */}
            {wrongGuesses.length > 0 && (
              <div className="text-center">
                <h4 className="text-lg font-bold text-red-400 mb-2">Wrong Letters:</h4>
                <div className="flex justify-center gap-2 flex-wrap">
                  {wrongGuesses.map((letter, index) => (
                    <Badge key={index} variant="destructive">
                      {letter}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Over Screen */}
      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <Card className="holographic border-2 border-neon-cyan">
          <CardContent className="p-8 text-center space-y-4">
            {gameStatus === 'won' ? (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-neon-cyan">Puzzle Solved!</h2>
                <p className="text-xl text-neon-purple">
                  "{currentPhrase?.phrase}"
                </p>
                <div className="flex items-center justify-center gap-4 text-2xl">
                  <Zap className="w-8 h-8 text-yellow-400" />
                  <span className="font-bold">{score.toLocaleString()} Points</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💀</div>
                <h2 className="text-3xl font-bold text-red-400">Game Over!</h2>
                <p className="text-xl text-muted-foreground">
                  The phrase was: <span className="text-neon-cyan">"{currentPhrase?.phrase}"</span>
                </p>
              </>
            )}
            
            <Button 
              onClick={startNewGame}
              className="cyber-button text-xl px-8 py-4"
              disabled={isSubmitting}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WheelOfFortuneGame;
