
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TriviaQuestion } from '@/types/trivia';

interface TriviaGameplayProps {
  category: string;
  onGameComplete: () => void;
  onBackToMenu: () => void;
}

export const TriviaGameplay = ({ category, onGameComplete, onBackToMenu }: TriviaGameplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(30);
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

  const loadQuestions = async () => {
    try {
      // Mock questions for now since database tables don't exist yet
      const mockQuestions: TriviaQuestion[] = [
        {
          id: '1',
          category: category,
          question: 'What is the capital of France?',
          option_a: 'London',
          option_b: 'Berlin',
          option_c: 'Paris',
          option_d: 'Madrid',
          correct_answer: 'C',
          difficulty: 'easy',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          category: category,
          question: 'Which planet is known as the Red Planet?',
          option_a: 'Venus',
          option_b: 'Mars',
          option_c: 'Jupiter',
          option_d: 'Saturn',
          correct_answer: 'B',
          difficulty: 'easy',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        // Add more mock questions...
        {
          id: '3',
          category: category,
          question: 'What is the largest ocean on Earth?',
          option_a: 'Atlantic',
          option_b: 'Indian',
          option_c: 'Pacific',
          option_d: 'Arctic',
          correct_answer: 'C',
          difficulty: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Simulate more questions to reach 10
      const expandedQuestions = [...mockQuestions];
      while (expandedQuestions.length < questionsPerGame) {
        expandedQuestions.push({
          ...mockQuestions[expandedQuestions.length % mockQuestions.length],
          id: `${expandedQuestions.length + 1}`,
          question: `Sample question ${expandedQuestions.length + 1} for ${category}?`,
        });
      }

      setQuestions(expandedQuestions);
      setGameStatus('playing');
      setTimeLeft(30);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error Loading Questions",
        description: "Failed to load trivia questions. Please try again.",
        variant: "destructive",
      });
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
        setTimeLeft(30);
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
    toast({
      title: "Time's Up! ⏰",
      description: "Moving to next question...",
      variant: "destructive",
    });

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setTimeLeft(30);
        setAnswerSubmitted(false);
      } else {
        endGame();
      }
    }, 1500);
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
    if (timeRemaining >= 20) return 1.5; // 150% for very fast
    if (timeRemaining >= 10) return 1.2; // 120% for fast
    return 1.0; // Base points for slow
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
    
    if (user) {
      try {
        // Award CCTR tokens (this will be implemented when the database is ready)
        await supabase
          .from('token_transactions')
          .insert({
            user_id: user.id,
            amount: score,
            transaction_type: 'trivia_reward',
            description: `Trivia game: ${correctAnswers}/${questions.length} correct, ${score} points`
          });

        toast({
          title: "Game Complete! 🎉",
          description: `You earned ${score} CCTR tokens!`,
        });
      } catch (error) {
        console.error('Error saving game results:', error);
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
          <div className="text-4xl mb-4">🔄</div>
          <h3 className="text-xl font-bold text-neon-cyan mb-2">Loading Questions...</h3>
          <p className="text-muted-foreground">Preparing your trivia challenge</p>
        </CardContent>
      </Card>
    );
  }

  if (gameStatus === 'finished') {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan text-center">
            🏆 GAME COMPLETE!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gray-800/30 rounded">
              <div className="text-3xl font-bold text-neon-green">{score}</div>
              <p className="text-sm text-muted-foreground">Total Score</p>
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
          
          {user && (
            <div className="mb-6">
              <Badge className="bg-neon-green text-black text-lg px-4 py-2">
                +{score} CCTR Earned!
              </Badge>
            </div>
          )}
          
          <Button onClick={onBackToMenu} className="cyber-button">
            Back to Menu
          </Button>
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
              Question {currentQuestionIndex + 1} of {questions.length}
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
            <Badge variant={timeLeft <= 10 ? "destructive" : "default"}>
              {timeLeft}s
            </Badge>
          </div>
          <Progress 
            value={(timeLeft / 30) * 100} 
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
              {currentQuestion.difficulty.toUpperCase()}
            </Badge>
            <Badge variant="outline">{category.toUpperCase()}</Badge>
          </div>
          
          <CardTitle className="font-display text-xl md:text-2xl text-center">
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
                className={`h-auto p-4 text-left justify-start ${
                  showResult && answerSubmitted ? (
                    option.letter === currentQuestion.correct_answer ? 
                    'bg-green-500/20 border-green-500' :
                    option.letter === selectedAnswer ?
                    'bg-red-500/20 border-red-500' :
                    'opacity-50'
                  ) : selectedAnswer === option.letter ?
                  'cyber-button' : 
                  'hover:bg-gray-800/50'
                }`}
              >
                <span className="font-bold mr-3">{option.letter}.</span>
                <span>{option.text}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || answerSubmitted}
              className="cyber-button px-8"
            >
              {answerSubmitted ? 'Submitted' : 'Submit Answer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
