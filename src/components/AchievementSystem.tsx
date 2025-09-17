import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Lock, CheckCircle } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'common': return 'bg-gray-500';
    case 'uncommon': return 'bg-green-500';
    case 'rare': return 'bg-blue-500';
    case 'legendary': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const getDifficultyBorder = (difficulty: string) => {
  switch (difficulty) {
    case 'common': return 'border-gray-300';
    case 'uncommon': return 'border-green-300';
    case 'rare': return 'border-blue-300';
    case 'legendary': return 'border-purple-300 shadow-purple-200/50';
    default: return 'border-gray-300';
  }
};

export const AchievementSystem = () => {
  const {
    achievements,
    userAchievements,
    achievementProgress,
    loading,
    getAchievementStats,
    isAchievementEarned,
    getAchievementProgressById
  } = useAchievements();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const stats = getAchievementStats();

  if (loading) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-neon-cyan flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Achievement System
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="text-neon-cyan flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Achievement System
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Track your progress and unlock rewards across the Cyber City Arcade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Achievement Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neon-cyan/10 rounded-lg p-4 border border-neon-cyan/30">
            <div className="text-2xl font-bold text-neon-cyan">{stats.earnedAchievements}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </div>
          <div className="bg-neon-purple/10 rounded-lg p-4 border border-neon-purple/30">
            <div className="text-2xl font-bold text-neon-purple">{stats.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
          <div className="bg-neon-pink/10 rounded-lg p-4 border border-neon-pink/30">
            <div className="text-2xl font-bold text-neon-pink">{stats.completionRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
            <div className="text-2xl font-bold text-amber-500">{stats.totalAchievements}</div>
            <div className="text-sm text-muted-foreground">Total Available</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{stats.earnedAchievements} / {stats.totalAchievements}</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs capitalize"
            >
              {category === 'all' ? 'All' : category.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => {
            const isEarned = isAchievementEarned(achievement.id);
            const progress = getAchievementProgressById(achievement.id);
            const progressPercentage = progress 
              ? (progress.current_progress / progress.target_progress) * 100 
              : 0;

            return (
              <Card 
                key={achievement.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isEarned 
                    ? `${getDifficultyBorder(achievement.difficulty)} shadow-lg` 
                    : 'border-muted opacity-70'
                }`}
              >
                {/* Difficulty Indicator */}
                <div className={`absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] ${getDifficultyColor(achievement.difficulty)}`} />
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div>
                        <CardTitle className="text-base leading-tight">
                          {achievement.name}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${getDifficultyColor(achievement.difficulty)} text-white border-0`}
                        >
                          {achievement.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isEarned ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {achievement.description}
                  </p>
                  
                  {/* Progress Bar */}
                  {progress && !isEarned && (
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{progress.current_progress} / {progress.target_progress}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold">{achievement.points} pts</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {achievement.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No achievements found in this category.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};