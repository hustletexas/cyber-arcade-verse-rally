import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TriviaQuestion } from '@/types/trivia';
import { getRandomMixedQuestions } from '@/data/gamingTriviaQuestions';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LoadingText } from '@/components/ui/loading-states';

interface TriviaGameplayProps {
  category: string;
  playMode: 'free' | 'paid';
  onGameComplete: (correctAnswers?: number) => void;
  onBackToMenu: () => void;
}

export const TriviaGameplay = ({ category, playMode, onGameComplete, onBackToMenu }: TriviaGameplayProps) => {
  const { user } = useAuth();
  const { balance, refetch: refetchBalance } = useUserBalance();
  const { toast } = useToast();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  
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
      // Loading questions for selected category
      
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
      // Questions loaded successfully
      
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
      
      // Award points based on play mode
      const points = playMode === 'paid' ? 1 : 0;
      
      setScore(score + points);

      toast({
        title: "Correct! 🎉",
        description: playMode === 'paid' ? `+1 CCTR earned!` : `Great job!`,
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
    
    // Award CCTR tokens for correct answers only in paid mode
    if (playMode === 'paid' && user && correctAnswers > 0) {
      try {
        const { data, error } = await supabase.rpc('award_trivia_rewards', {
          correct_answers_param: correctAnswers,
          total_questions_param: questions.length,
          category_param: category
        });

        if (error) {
          console.error('Error awarding rewards:', error);
        } else {
          const result = data as { success: boolean; error?: string } | null;
          if (!result?.success) {
            console.error('Failed to award rewards:', result?.error);
          }
        }

        await refetchBalance();
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
    
    const message = playMode === 'paid' 
      ? `You earned ${score} CCTR with ${correctAnswers}/${questions.length} correct answers!`
      : `You got ${correctAnswers}/${questions.length} correct! Connect wallet to earn CCTR.`;
    
    toast({
      title: "Game Complete! 🏆",
      description: message,
    });

    setTimeout(() => {
      onGameComplete(correctAnswers);
    }, 3000);
  };

  if (gameStatus === 'loading') {
    return (
      <Card className="arcade-frame">
        <CardContent className="text-center py-12">
          <LoadingSpinner size="xl" variant="orbit" className="mx-auto mb-6" />
          <h3 className="text-xl font-bold text-neon-cyan mb-2 glitch-text" data-text="Loading Gaming Questions...">
            Loading Gaming Questions...
          </h3>
          <LoadingText 
            text={`Preparing your ${category} trivia challenge`}
            className="text-lg"
          />
          
          {/* Progress simulation */}
          <div className="w-full max-w-xs mx-auto mt-6">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan animate-shimmer rounded-full w-full bg-[length:200%_100%]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameStatus === 'finished') {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const connectedWallet = primaryWallet;
    
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
              <div className="text-3xl font-bold text-neon-green">{playMode === 'paid' ? score : correctAnswers}</div>
              <p className="text-sm text-muted-foreground">{playMode === 'paid' ? 'CCTR Earned' : 'Correct Answers'}</p>
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
          
          <div className="mb-4 space-y-2">
            <Badge className={`text-black text-lg px-4 py-2 ${playMode === 'paid' ? 'bg-neon-cyan' : 'bg-neon-green'}`}>
              {playMode === 'paid' ? '💎 PAID MODE' : '🎮 FREE PLAY'}
            </Badge>
            <div>
              <Badge className="bg-neon-purple text-black px-3 py-1">
                🎮 {category.replace('-', ' ').toUpperCase()} MASTER
              </Badge>
            </div>
          </div>
          
          {playMode === 'paid' && connectedWallet && (
            <div className="mb-6">
              <Badge className="bg-neon-green text-black text-lg px-4 py-2">
                🔗 Score Saved! +{score} CCTR
              </Badge>
            </div>
          )}
          
          {playMode === 'free' && !connectedWallet && (
            <div className="mb-6">
              <p className="text-sm text-neon-pink">
                💡 Connect wallet to earn CCTR tokens in paid mode!
              </p>
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
            <span className="text-sm text-muted-foreground">{playMode === 'paid' ? 'Score' : 'Correct'}</span>
            <span className="text-xl font-bold text-neon-green">{playMode === 'paid' ? `${score} CCTR` : `${correctAnswers}/${questions.length}`}</span>
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
              {currentQuestion.difficulty.toUpperCase()} {playMode === 'paid' ? '• +1 CCTR if correct' : ''}
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
