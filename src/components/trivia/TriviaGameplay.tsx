import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSolanaScore } from '@/hooks/useSolanaScore';
import { useWallet } from '@/hooks/useWallet';
import { TriviaQuestion } from '@/types/trivia';
import { getRandomMixedQuestions } from '@/data/gamingTriviaQuestions';

interface TriviaGameplayProps {
  category: string;
  onGameComplete: () => void;
  onBackToMenu: () => void;
}

export const TriviaGameplay = ({ category, onGameComplete, onBackToMenu }: TriviaGameplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { submitScore, isSubmitting } = useSolanaScore();
  const { getConnectedWallet, isWalletConnected } = useWallet();
  
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStatus, setGameStatus] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [showResult, setShowResult] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const questionsPerGame = 10;

  useEffect(() => {
    loadQuestions();
  }, [category]);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0 && !answerSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answerSubmitted) {
      handleTimeOut();
    }
  }, [timeLeft, gameStatus, answerSubmitted]);

  const loadQuestions = () => {
    try {
      console.log(`Loading questions for category: ${category}`);
      
      // Get real gaming questions for the selected category
      const gameQuestions = getRandomMixedQuestions(category, questionsPerGame);
      
      if (gameQuestions.length === 0) {
        toast({
          title: "No Questions Available",
          description: `No questions found for category: ${category}. Please try another category.`,
          variant: "destructive",
        });
        onBackToMenu();
        return;
      }

      console.log(`Loaded ${gameQuestions.length} questions for ${category}:`, gameQuestions);
      
      setQuestions(gameQuestions);
      setGameStatus('playing');
      setTimeLeft(15);
      setCurrentQuestionIndex(0);
      setSelectedAnswer('');
      setScore(0);
      setCorrectAnswers(0);
      setShowResult(false);
      setAnswerSubmitted(false);
      
      toast({
        title: "Game Started! 🎮",
        description: `Loading ${category} gaming trivia questions - 15 seconds per question!`,
      });
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error Loading Questions",
        description: "Failed to load trivia questions. Please try again.",
        variant: "destructive",
      });
      onBackToMenu();
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (answerSubmitted) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || answerSubmitted) return;

    setAnswerSubmitted(true);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      
      // Calculate points based on difficulty and speed
      let points = getPointsForDifficulty(currentQuestion.difficulty);
      const speedBonus = getSpeedBonus(timeLeft);
      points = Math.floor(points * speedBonus);
      
      setScore(score + points);

      toast({
        title: "Correct! 🎉",
        description: `+${points} CCTR (${speedBonus}x speed bonus)`,
      });
    } else {
      toast({
        title: "Incorrect ❌",
        description: `The correct answer was ${getOptionText(currentQuestion, currentQuestion.correct_answer)}`,
        variant: "destructive",
      });
    }

    setShowResult(true);
    
    // Show result for 2 seconds then move to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setTimeLeft(15);
        setShowResult(false);
        setAnswerSubmitted(false);
      } else {
        endGame();
      }
    }, 2000);
  };

  const handleTimeOut = () => {
    if (answerSubmitted) return;
    
    setAnswerSubmitted(true);
    const currentQuestion = questions[currentQuestionIndex];
    
    toast({
      title: "Time's Up! ⏰",
      description: `No rewards earned - Correct answer: ${getOptionText(currentQuestion, currentQuestion.correct_answer)}`,
      variant: "destructive",
    });

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setTimeLeft(15);
        setShowResult(false);
        setAnswerSubmitted(false);
      } else {
        endGame();
      }
    }, 2000);
  };

  const getPointsForDifficulty = (difficulty: string): number => {
    switch (difficulty) {
      case 'easy': return 100;
      case 'medium': return 200;
      case 'hard': return 300;
      default: return 100;
    }
  };

  const getSpeedBonus = (timeRemaining: number): number => {
    // Updated for 15-second timer
    if (timeRemaining >= 12) return 1.5; // 150% for very fast (12-15 seconds)
    if (timeRemaining >= 8) return 1.2; // 120% for fast (8-11 seconds)
    return 1.0; // Base points for slow (0-7 seconds)
  };

  const getOptionText = (question: TriviaQuestion, optionLetter: string): string => {
    switch (optionLetter) {
      case 'A': return question.option_a;
      case 'B': return question.option_b;
      case 'C': return question.option_c;
      case 'D': return question.option_d;
      default: return '';
    }
  };

  const endGame = async () => {
    setGameStatus('finished');
    
    toast({
      title: "Game Complete! 🏆",
      description: `You scored ${score} CCTR with ${correctAnswers}/${questions.length} correct answers!`,
    });
    
    // Submit score to Solana blockchain if wallet is connected
    if (isWalletConnected()) {
      const result = await submitScore(score, category);
      if (result.success) {
        console.log('Score successfully submitted to Solana blockchain');
        toast({
          title: "Score Submitted! 🔗",
          description: "Your score has been recorded on the Solana blockchain",
        });
      }
    }

    // Also save to traditional database if user is authenticated
    if (user) {
      try {
        await supabase
          .from('token_transactions')
          .insert({
            user_id: user.id,
            amount: score,
            transaction_type: 'trivia_reward',
            description: `${category} trivia: ${correctAnswers}/${questions.length} correct, ${score} CCTR earned`
          });
        
        console.log('Score saved to database');
      } catch (error) {
        console.error('Error saving to database:', error);
      }
    }

    setTimeout(() => {
      onGameComplete();
    }, 3000);
  };

  if (gameStatus === 'loading') {
    return (
      <Card className="arcade-frame">
        <CardContent className="text-center py-12">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-neon-cyan mb-2">Loading Gaming Questions...</h3>
          <p className="text-muted-foreground">Preparing your {category} trivia challenge</p>
        </CardContent>
      </Card>
    );
  }

  if (gameStatus === 'finished') {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const connectedWallet = getConnectedWallet();
    
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan text-center">
            🏆 GAMING TRIVIA COMPLETE!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gray-800/30 rounded">
              <div className="text-3xl font-bold text-neon-green">{score}</div>
              <p className="text-sm text-muted-foreground">CCTR Earned</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded">
              <div className="text-3xl font-bold text-neon-purple">{correctAnswers}/{questions.length}</div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded">
              <div className="text-3xl font-bold text-neon-pink">{accuracy}%</div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>
          
          <div className="mb-4">
            <Badge className="bg-neon-cyan text-black text-lg px-4 py-2 mb-2">
              🎮 {category.replace('-', ' ').toUpperCase()} MASTER
            </Badge>
          </div>
          
          {connectedWallet && (
            <div className="mb-6">
              <Badge className="bg-neon-green text-black text-lg px-4 py-2">
                🔗 Blockchain Verified! +{score} CCTR
              </Badge>
              {isSubmitting && (
                <p className="text-sm text-muted-foreground mt-2">
                  Submitting to blockchain...
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Button onClick={onBackToMenu} className="cyber-button w-full">
              🏠 Back to Gaming Categories
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-display text-2xl text-neon-cyan">
              🎮 {category.replace('-', ' ').toUpperCase()} Question {currentQuestionIndex + 1}/{questions.length}
            </CardTitle>
            <Button onClick={onBackToMenu} variant="outline" size="sm">
              ← Exit Game
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Timer and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="holographic p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Time Remaining</span>
            <Badge variant={timeLeft <= 5 ? "destructive" : timeLeft <= 10 ? "secondary" : "default"}>
              {timeLeft}s
            </Badge>
          </div>
          <Progress 
            value={(timeLeft / 15) * 100} 
            className="h-3"
          />
        </Card>
        
        <Card className="holographic p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Score</span>
            <span className="text-xl font-bold text-neon-green">{score} CCTR</span>
          </div>
        </Card>
      </div>

      {/* Question */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`${
              currentQuestion.difficulty === 'easy' ? 'bg-green-500' :
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-500' :
              'bg-red-500'
            } text-white`}>
              {currentQuestion.difficulty.toUpperCase()} • +{getPointsForDifficulty(currentQuestion.difficulty)} CCTR
            </Badge>
            <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
              🎮 {category.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <CardTitle className="font-display text-xl md:text-2xl text-center leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { letter: 'A', text: currentQuestion.option_a },
              { letter: 'B', text: currentQuestion.option_b },
              { letter: 'C', text: currentQuestion.option_c },
              { letter: 'D', text: currentQuestion.option_d }
            ].map((option) => (
              <Button
                key={option.letter}
                onClick={() => handleAnswerSelect(option.letter)}
                disabled={answerSubmitted}
                variant={selectedAnswer === option.letter ? "default" : "outline"}
                className={`h-auto p-4 text-left justify-start text-wrap ${
                  showResult && answerSubmitted ? (
                    option.letter === currentQuestion.correct_answer ? 
                    'bg-green-500/30 border-green-500 text-green-100' :
                    option.letter === selectedAnswer ?
                    'bg-red-500/30 border-red-500 text-red-100' :
                    'opacity-50'
                  ) : selectedAnswer === option.letter ?
                  'cyber-button' : 
                  'hover:bg-gray-800/50 transition-colors'
                }`}
              >
                <span className="font-bold mr-3 text-neon-cyan">{option.letter}.</span>
                <span className="flex-1">{option.text}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || answerSubmitted}
              className="cyber-button px-8 py-3"
              size="lg"
            >
              {answerSubmitted ? '✓ Submitted' : '🎯 Submit Answer'}
            </Button>
          </div>

          {showResult && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {currentQuestionIndex < questions.length - 1 
                  ? 'Next question loading...' 
                  : 'Calculating final score...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
