import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { CyberPinball } from '@/components/games/CyberPinball';
import { GalaxyBackground } from '@/components/games/GalaxyBackground';

const CyberPinballPage: React.FC = () => {
  const navigate = useNavigate();
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  const handleGameOver = (score: number) => {
    setFinalScore(score);
  };

  const handleRestart = () => {
    setFinalScore(null);
    setKey(prev => prev + 1);
  };

  return (
    <div className="cyber-columns-container min-h-screen">
      <GalaxyBackground />
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/50 backdrop-blur border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
          <Button variant="ghost" size="sm" onClick={() => { navigate('/'); window.scrollTo(0, 0); }} className="gap-2">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            CYBER PINBALL
          </h1>
          <Button variant="ghost" size="sm" onClick={handleRestart} className="gap-2">
            <RotateCcw size={16} />
            <span className="hidden sm:inline">New Game</span>
          </Button>
        </div>
      </div>

      {/* Game area */}
      <div className="relative z-10 max-w-5xl mx-auto p-4 flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Main game */}
        <div className="flex-shrink-0">
          <CyberPinball
            key={key}
            onGameOver={handleGameOver}
          />
        </div>

      </div>
    </div>
  );
};

export default CyberPinballPage;
