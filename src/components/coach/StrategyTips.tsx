
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserProfile {
  favoriteGames: string[];
  skillLevel: string;
  playtime: number;
  recentPerformance: string;
  weakAreas: string[];
  strengths: string[];
}

interface StrategyTipsProps {
  userProfile: UserProfile;
}

export const StrategyTips = ({ userProfile }: StrategyTipsProps) => {
  const [selectedGame, setSelectedGame] = useState('tetris');

  const strategyContent = {
    tetris: {
      beginner: [
        {
          title: 'Master the T-Spin Setup',
          content: 'Learn to create T-shaped cavities for massive point bonuses. Practice the LST stacking pattern.',
          difficulty: 'Intermediate',
          points: 300
        },
        {
          title: 'Line Clear Priorities',
          content: 'Focus on Tetrises (4-line clears) for maximum efficiency. Avoid singles unless necessary.',
          difficulty: 'Beginner',
          points: 100
        },
        {
          title: 'Speed vs Accuracy',
          content: 'At your level, focus on clean stacking over speed. Misdrops cost more than slow play.',
          difficulty: 'Beginner',
          points: 150
        }
      ],
      intermediate: [
        {
          title: 'Opening Strategies',
          content: 'Master TKI-3, DT Cannon, and Perfect Clear Opener for strong starts.',
          difficulty: 'Advanced',
          points: 500
        },
        {
          title: 'Mid-Game Transitions',
          content: 'Learn to switch from opening to mid-game stacking without creating vulnerabilities.',
          difficulty: 'Intermediate',
          points: 350
        }
      ]
    },
    pacman: {
      beginner: [
        {
          title: 'Ghost Pattern Recognition',
          content: 'Each ghost has unique movement patterns. Blinky chases, Pinky ambushes, Inky flanks, Sue is unpredictable.',
          difficulty: 'Intermediate',
          points: 250
        },
        {
          title: 'Power Pellet Strategy',
          content: 'Save power pellets for when ghosts are close. Chain ghost captures for exponential points.',
          difficulty: 'Beginner',
          points: 200
        }
      ]
    },
    galaga: {
      beginner: [
        {
          title: 'Formation Flying',
          content: 'Target formation flights for bonus points. Wait for them to organize before attacking.',
          difficulty: 'Intermediate',
          points: 300
        },
        {
          title: 'Challenge Stage Mastery',
          content: 'Perfect challenge stages for massive bonuses. Learn enemy movement patterns.',
          difficulty: 'Advanced',
          points: 500
        }
      ]
    }
  };

  const personalizedTips = [
    {
      category: 'Speed Improvement',
      tip: 'Your reflexes need work. Try the finger independence exercises in the Reflex Training module.',
      relevance: userProfile.weakAreas.includes('Speed') ? 'high' : 'low'
    },
    {
      category: 'Combo Timing',
      tip: 'Practice rhythm-based exercises. Use a metronome to improve your timing consistency.',
      relevance: userProfile.weakAreas.includes('Combo Timing') ? 'high' : 'low'
    },
    {
      category: 'Pattern Recognition',
      tip: 'Excellent strength! Use this to help with advanced setup recognition in Tetris.',
      relevance: userProfile.strengths.includes('Pattern Recognition') ? 'high' : 'low'
    }
  ];

  const dailyChallenges = [
    {
      id: 'speed-challenge',
      title: '⚡ Speed Challenge',
      description: 'Complete 10 Tetris games in under 20 minutes',
      reward: '500 CCTR',
      difficulty: 'Hard'
    },
    {
      id: 'accuracy-challenge',
      title: '🎯 Accuracy Challenge', 
      description: 'Achieve 95% accuracy in Pac-Man for 5 consecutive games',
      reward: '300 CCTR',
      difficulty: 'Medium'
    },
    {
      id: 'combo-challenge',
      title: '🔥 Combo Master',
      description: 'Execute 3 perfect T-spins in a single Tetris game',
      reward: '750 CCTR',
      difficulty: 'Expert'
    }
  ];

  const currentStrategies = strategyContent[selectedGame as keyof typeof strategyContent] || strategyContent.tetris;

  return (
    <div className="space-y-6">
      {/* Personalized Tips */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🎯 PERSONALIZED RECOMMENDATIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalizedTips
              .filter(tip => tip.relevance === 'high')
              .map((tip, index) => (
                <Card key={index} className="arcade-frame p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-neon-purple mb-2">{tip.category}</h4>
                      <p className="text-sm text-muted-foreground">{tip.tip}</p>
                    </div>
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                      Priority
                    </Badge>
                  </div>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Game-Specific Strategies */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            🎮 GAME STRATEGIES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedGame} onValueChange={setSelectedGame}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="tetris" className="cyber-button">🧩 Tetris</TabsTrigger>
              <TabsTrigger value="pacman" className="cyber-button">👻 Pac-Man</TabsTrigger>
              <TabsTrigger value="galaga" className="cyber-button">🚀 Galaga</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedGame}>
              <div className="space-y-4">
                {Object.entries(currentStrategies).map(([level, strategies]) => (
                  <div key={level}>
                    <h3 className="font-bold text-neon-cyan mb-3 capitalize">{level} Level</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {strategies.map((strategy, index) => (
                        <Card key={index} className="holographic p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-neon-pink">{strategy.title}</h4>
                              <Badge className={`${
                                strategy.difficulty === 'Beginner' ? 'bg-neon-green/20 text-neon-green border-neon-green' :
                                strategy.difficulty === 'Intermediate' ? 'bg-neon-purple/20 text-neon-purple border-neon-purple' :
                                'bg-neon-pink/20 text-neon-pink border-neon-pink'
                              }`}>
                                {strategy.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{strategy.content}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-neon-green font-bold">+{strategy.points} CCTR</span>
                              <Button size="sm" className="cyber-button text-xs">
                                Practice
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <Card className="vending-machine">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-green">
            🏆 DAILY CHALLENGES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyChallenges.map((challenge) => (
              <Card key={challenge.id} className="arcade-frame p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-neon-cyan mb-1">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                    <div className="flex gap-2">
                      <Badge className={`${
                        challenge.difficulty === 'Medium' ? 'bg-neon-purple/20 text-neon-purple border-neon-purple' :
                        challenge.difficulty === 'Hard' ? 'bg-neon-pink/20 text-neon-pink border-neon-pink' :
                        'bg-neon-cyan/20 text-neon-cyan border-neon-cyan'
                      }`}>
                        {challenge.difficulty}
                      </Badge>
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                        {challenge.reward}
                      </Badge>
                    </div>
                  </div>
                  <Button className="cyber-button">
                    🎯 Accept
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-pink">
            💡 PRO TIPS OF THE DAY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="arcade-frame p-4 text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-bold text-neon-cyan mb-2">Mental Game</h4>
              <p className="text-sm text-muted-foreground">
                Take breaks every 45 minutes to maintain peak focus. Hydration affects reaction time by up to 12%.
              </p>
            </Card>
            
            <Card className="arcade-frame p-4 text-center">
              <div className="text-3xl mb-2">⚙️</div>
              <h4 className="font-bold text-neon-purple mb-2">Setup Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Lower your input lag by using gaming mode on your monitor and disabling Windows Game Bar.
              </p>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
