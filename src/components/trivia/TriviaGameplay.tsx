
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TriviaQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  difficulty: string;
}

interface TriviaGameplayProps {
  category: string;
  onGameEnd: () => void;
  onBackToMenu: () => void;
}

export const TriviaGameplay = ({ category, onGameEnd, onBackToMenu }: TriviaGameplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameStatus, setGameStatus] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      initializeGame();
    }
  }, [user, category]);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, gameStatus, showResult]);

  const initializeGame = async () => {
    if (!user) return;

    try {
      // Fetch random questions from the selected category
      const { data: questionsData, error: questionsError } = await supabase
        .from('trivia_questions')
        .select('*')
        .eq('category', category)
        .order('RANDOM()')
        .limit(10);

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        toast({
          title: "No Questions Available",
          description: "No questions found for this category",
          variant: "destructive",
        });
        onBackToMenu();
        return;
      }

      setQuestions(questionsData);

      // Create a new game session
      const { data: sessionData, error: sessionError } = await supabase
        .from('trivia_sessions')
        .insert({
          user_id: user.id,
          category: category,
          total_questions: questionsData.length,
          session_type: 'single',
          status: 'active'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(sessionData.id);
      setGameStatus('playing');
      setQuestionStartTime(new Date());

    } catch (error) {
      console.error('Error initializing game:', error);
      toast({
        title: "Game Error",
        description: "Failed to start the game",
        variant: "destructive",
      });
      onBackToMenu();
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    const responseTime = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);

    // Calculate score using the database function
    const { data: scoreData, error: scoreError } = await supabase
      .rpc('calculate_trivia_score', {
        response_time: responseTime,
        is_correct: isCorrect,
        difficulty: currentQuestion.difficulty
      });

    const pointsAwarded = scoreError ? 0 : (scoreData || 0);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + pointsAwarded);
    }

    // Save the answer
    if (sessionId) {
      await supabase
        .from('trivia_answers')
        .insert({
          session_id: sessionId,
          question_id: currentQuestion.id,
          user_answer: answer,
          is_correct: isCorrect,
          response_time: responseTime,
          points_awarded: pointsAwarded
        });
    }

    toast({
      title: isCorrect ? "Correct! 🎉" : "Wrong Answer 😔",
      description: isCorrect 
        ? `+${pointsAwarded} points! ${responseTime <= 10 ? '⚡ Speed bonus!' : ''}`
        : `The correct answer was ${currentQuestion.correct_answer}`,
      variant: isCorrect ? "default" : "destructive",
    });

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleTimeUp = () => {
    if (showResult) return;
    
    setShowResult(true);
    toast({
      title: "Time's Up! ⏰",
      description: "You ran out of time for this question",
      variant: "destructive",
    });

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
      setQuestionStartTime(new Date());
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameStatus('finished');

    if (sessionId && user) {
      // Update session with final results
      await supabase
        .from('trivia_sessions')
        .update({
          total_score: score,
          correct_answers: correctAnswers,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Award tokens for participation
      const tokenReward = Math.floor(score / 10); // 1 token per 10 points
      if (tokenReward > 0) {
        await supabase
          .from('token_transactions')
          .insert({
            user_id: user.id,
            amount: tokenReward,
            transaction_type: 'trivia_reward',
            description: `Trivia game reward: ${tokenReward} CCTR for ${correctAnswers}/${questions.length} correct answers`
          });

        toast({
          title: "Rewards Earned! 💰",
          description: `You earned ${tokenReward} CCTR tokens!`,
        });
      }
    }

    setTimeout(() => {
      onGameEnd();
    }, 3000);
  };

  if (gameStatus === 'loading') {
    return (
      <Card className="arcade-frame">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-neon-cyan">Loading Game...</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan text-center">
            🎉 GAME COMPLETE!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-neon-green">Final Score: {score}</div>
              <div className="text-lg text-neon-purple">
                Correct Answers: {correctAnswers}/{questions.length}
              </div>
              <div className="text-lg text-neon-cyan">
                Accuracy: {Math.round((correctAnswers / questions.length) * 100)}%
              </div>
            </div>
            <Button onClick={onBackToMenu} className="cyber-button">
              🎮 PLAY AGAIN
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const options = [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d }
  ];

  const getOptionClass = (optionKey: string) => {
    if (!showResult) return 'holographic hover:bg-gray-700/50 cursor-pointer';
    if (selectedAnswer === optionKey) {
      return selectedAnswer === currentQuestion.correct_answer 
        ? 'bg-neon-green/20 border-neon-green' 
        : 'bg-red-500/20 border-red-500';
    }
    if (optionKey === currentQuestion.correct_answer) {
      return 'bg-neon-green/20 border-neon-green';
    }
    return 'holographic opacity-50';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-display text-xl text-neon-cyan">
              🧠 {category.toUpperCase()} TRIVIA
            </CardTitle>
            <Button onClick={onBackToMenu} variant="outline" size="sm">
              ← Back to Menu
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats */}
      <Card className="holographic">
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-neon-purple">{currentQuestionIndex + 1}</div>
              <div className="text-xs text-muted-foreground">Question</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-green">{score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-cyan">{correctAnswers}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-neon-pink'}`}>
                {timeLeft}
              </div>
              <div className="text-xs text-muted-foreground">Seconds</div>
            </div>
          </div>
          <Progress 
            value={(timeLeft / 30) * 100} 
            className="mt-4 h-2" 
          />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Badge className={`${
              currentQuestion.difficulty === 'easy' ? 'bg-neon-green' :
              currentQuestion.difficulty === 'medium' ? 'bg-neon-cyan' : 'bg-neon-pink'
            } text-black`}>
              {currentQuestion.difficulty.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="border-neon-purple text-neon-purple">
              {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>
          <CardTitle className="font-display text-xl text-neon-cyan leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => (
              <Card
                key={option.key}
                className={`p-4 transition-all duration-300 ${getOptionClass(option.key)}`}
                onClick={() => !showResult && handleAnswerSelect(option.key)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-neon-cyan text-neon-cyan w-8 h-8 flex items-center justify-center">
                    {option.key}
                  </Badge>
                  <span className="text-sm font-medium">{option.text}</span>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Speed Bonus Info */}
      <Card className="holographic">
        <CardContent className="pt-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              ⚡ Answer within 10 seconds for <span className="text-neon-green font-bold">1.5x points</span> |
              📊 Base Points: Easy (100) • Medium (200) • Hard (300)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
