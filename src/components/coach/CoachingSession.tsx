
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CoachingArea {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: string;
}

interface UserProfile {
  favoriteGames: string[];
  skillLevel: string;
  playtime: number;
  recentPerformance: string;
  weakAreas: string[];
  strengths: string[];
}

interface CoachingSessionProps {
  area: CoachingArea;
  userProfile: UserProfile;
  onEndSession: () => void;
}

export const CoachingSession = ({ area, userProfile, onEndSession }: CoachingSessionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const getSessionContent = () => {
    switch (area.id) {
      case 'strategy':
        return {
          title: 'Game Strategy Mastery',
          exercises: [
            {
              id: 'pattern-analysis',
              name: 'Pattern Analysis',
              instruction: 'Study this Tetris sequence and identify the optimal placement strategy',
              type: 'visual',
              content: 'Analyze how to create T-spin setups for maximum points'
            },
            {
              id: 'decision-making',
              name: 'Quick Decision Making',
              instruction: 'You have 3 seconds to choose the best move in this scenario',
              type: 'interactive',
              content: 'Multiple choice: Which piece placement yields highest score?'
            },
            {
              id: 'long-term-planning',
              name: 'Long-term Planning',
              instruction: 'Plan your next 5 moves to set up a devastating combo',
              type: 'planning',
              content: 'Draw your strategy on the game board'
            }
          ]
        };
      case 'reflexes':
        return {
          title: 'Reflex Enhancement Training',
          exercises: [
            {
              id: 'reaction-test',
              name: 'Reaction Time Test',
              instruction: 'Click as fast as possible when the target appears',
              type: 'reaction',
              content: 'Average pro reaction time: 180ms. Can you beat it?'
            },
            {
              id: 'combo-training',
              name: 'Combo Speed Training',
              instruction: 'Execute this button sequence as quickly and accurately as possible',
              type: 'sequence',
              content: '↑↑↓↓←→←→BA - Street Fighter combo practice'
            },
            {
              id: 'peripheral-vision',
              name: 'Peripheral Vision',
              instruction: 'Track multiple objects while focusing on the center target',
              type: 'tracking',
              content: 'Essential for games like Galaga where enemies come from all directions'
            }
          ]
        };
      case 'mindset':
        return {
          title: 'Gaming Psychology & Mental Focus',
          exercises: [
            {
              id: 'pressure-training',
              name: 'Pressure Situations',
              instruction: 'Practice staying calm during high-stakes moments',
              type: 'mental',
              content: 'Visualization: You\'re in the tournament finals, 1 life left...'
            },
            {
              id: 'flow-state',
              name: 'Flow State Achievement',
              instruction: 'Learn breathing techniques to enter the gaming zone',
              type: 'meditation',
              content: '4-7-8 breathing: Inhale 4s, Hold 7s, Exhale 8s'
            },
            {
              id: 'tilt-recovery',
              name: 'Tilt Recovery',
              instruction: 'Strategies to bounce back from frustrating losses',
              type: 'psychological',
              content: 'Transform anger into learning opportunities'
            }
          ]
        };
      default:
        return {
          title: 'Generic Training Session',
          exercises: [
            {
              id: 'basic-training',
              name: 'Basic Training',
              instruction: 'Complete this training module',
              type: 'general',
              content: 'Follow the on-screen instructions'
            }
          ]
        };
    }
  };

  const sessionContent = getSessionContent();
  const currentExercise = sessionContent.exercises[currentStep];

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionProgress(prev => Math.min(prev + 2, 100));
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const completeExercise = () => {
    if (currentExercise && !completedExercises.includes(currentExercise.id)) {
      setCompletedExercises(prev => [...prev, currentExercise.id]);
      
      if (currentStep < sessionContent.exercises.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const isSessionComplete = completedExercises.length === sessionContent.exercises.length;

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
                {area.icon} {sessionContent.title}
              </CardTitle>
              <p className="text-muted-foreground mt-2">{area.description}</p>
            </div>
            <Button onClick={onEndSession} variant="outline" className="border-neon-pink text-neon-pink">
              ✕ End Session
            </Button>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Session Progress</span>
              <span>{Math.min(sessionProgress, 100)}%</span>
            </div>
            <Progress value={sessionProgress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Exercise */}
      {currentExercise && (
        <Card className="holographic">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-display text-xl text-neon-purple">
                Exercise {currentStep + 1}: {currentExercise.name}
              </CardTitle>
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                {currentExercise.type.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg">{currentExercise.instruction}</p>
              
              <Card className="arcade-frame p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {area.id === 'strategy' && '🎯'}
                    {area.id === 'reflexes' && '⚡'}
                    {area.id === 'mindset' && '🧠'}
                  </div>
                  <p className="text-muted-foreground">{currentExercise.content}</p>
                  
                  {currentExercise.type === 'reaction' && (
                    <div className="mt-6">
                      <div className="w-32 h-32 bg-neon-pink/20 border-2 border-neon-pink rounded-full mx-auto flex items-center justify-center cursor-pointer hover:bg-neon-pink/40 transition-colors">
                        <span className="text-2xl">👆</span>
                      </div>
                      <p className="mt-2 text-sm">Click when it lights up!</p>
                    </div>
                  )}
                  
                  {currentExercise.type === 'sequence' && (
                    <div className="mt-6 flex justify-center gap-2">
                      {['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'].map((key, i) => (
                        <Badge key={i} className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan text-lg p-2">
                          {key}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={completeExercise}
                  className="cyber-button"
                  disabled={completedExercises.includes(currentExercise.id)}
                >
                  {completedExercises.includes(currentExercise.id) ? '✅ Completed' : '🎯 Complete Exercise'}
                </Button>
                
                {currentStep > 0 && (
                  <Button 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    variant="outline"
                    className="border-neon-purple text-neon-purple"
                  >
                    ← Previous
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Progress */}
      <Card className="vending-machine">
        <CardHeader>
          <CardTitle className="font-display text-lg text-neon-green">
            📋 Exercise Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessionContent.exercises.map((exercise, index) => (
              <Card key={exercise.id} className={`arcade-frame p-4 ${
                completedExercises.includes(exercise.id) ? 'border-neon-green' : 
                index === currentStep ? 'border-neon-cyan' : 'border-gray-600'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {completedExercises.includes(exercise.id) ? '✅' : 
                     index === currentStep ? '⏳' : '⭕'}
                  </div>
                  <h4 className="font-bold text-sm text-neon-cyan mb-1">{exercise.name}</h4>
                  <p className="text-xs text-muted-foreground">{exercise.type}</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Complete */}
      {isSessionComplete && (
        <Card className="arcade-frame border-neon-green/50">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-neon-green mb-2">Session Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Excellent work! You've completed all exercises in this training session.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={onEndSession} className="cyber-button">
                🏠 Back to Coach
              </Button>
              <Button variant="outline" className="border-neon-purple text-neon-purple">
                📊 View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
