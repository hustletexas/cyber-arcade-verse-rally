import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, X, Star } from 'lucide-react';
import { Achievement, UserAchievement } from '@/hooks/useAchievements';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'common': return 'bg-gray-500';
    case 'uncommon': return 'bg-green-500';
    case 'rare': return 'bg-blue-500';
    case 'legendary': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  autoClose = true,
  duration = 6000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <Card className="w-80 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border-neon-cyan/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-neon-cyan flex items-center gap-2 text-lg">
              <Trophy className="w-6 h-6 text-amber-500 animate-pulse" />
              Achievement Unlocked!
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-start gap-3">
            <div className="text-4xl animate-bounce">{achievement.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">{achievement.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {achievement.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`text-xs ${getDifficultyColor(achievement.difficulty)} text-white border-0`}
                  >
                    {achievement.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-500">
                      +{achievement.points} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Achievement Queue Manager Component
interface AchievementQueueProps {
  achievements: Achievement[];
  onClearQueue: () => void;
}

export const AchievementQueue: React.FC<AchievementQueueProps> = ({
  achievements,
  onClearQueue
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) {
      setCurrentIndex(0);
    }
  }, [achievements.length]);

  const handleClose = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClearQueue();
    }
  };

  if (achievements.length === 0 || currentIndex >= achievements.length) {
    return null;
  }

  return (
    <AchievementNotification
      achievement={achievements[currentIndex]}
      onClose={handleClose}
      autoClose={true}
      duration={5000}
    />
  );
};