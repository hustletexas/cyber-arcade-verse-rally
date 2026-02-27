import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { CyberPinball } from '@/components/games/CyberPinball';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="text-xl">🎰</span>
            CYBER PINBALL
          </h1>
          <Button variant="ghost" size="sm" onClick={handleRestart} className="gap-2">
            <RotateCcw size={16} />
            <span className="hidden sm:inline">New Game</span>
          </Button>
        </div>
      </div>

      {/* Game area */}
      <div className="max-w-5xl mx-auto p-4 flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Main game */}
        <div className="flex-shrink-0">
          <CyberPinball
            key={key}
            onGameOver={handleGameOver}
          />
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-64 space-y-4">
          {/* Game info */}
          <Card className="arcade-frame">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Trophy size={14} className="text-neon-cyan" />
                HOW TO PLAY
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>🎯 <strong className="text-foreground">Launch:</strong> Hold Space, release to fire</p>
                <p>◀ <strong className="text-foreground">Left Flipper:</strong> Arrow Left or Z</p>
                <p>▶ <strong className="text-foreground">Right Flipper:</strong> Arrow Right or M</p>
                <p>💥 <strong className="text-foreground">Nudge:</strong> Press T (3 = TILT!)</p>
              </div>
            </CardContent>
          </Card>

          {/* Scoring */}
          <Card className="arcade-frame">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground">SCORING</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Bumper</span><span className="text-neon-cyan">100</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Slingshot</span><span className="text-neon-cyan">50</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ramp Shot</span><span className="text-neon-cyan">250</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CCA Lane</span><span className="text-neon-cyan">500</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CCA Complete</span><span className="text-neon-pink">5,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Skill Shot</span><span className="text-neon-pink">2,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Spinner</span><span className="text-neon-cyan">25</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Combo Max</span><span className="text-neon-pink">5x</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Table features */}
          <Card className="arcade-frame">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground">TABLE FEATURES</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>🏙 <strong className="text-foreground">Downtown Rush</strong> — Left ramp</p>
                <p>🛣 <strong className="text-foreground">Neon Highway</strong> — Right ramp</p>
                <p>⚡ <strong className="text-foreground">Galaxy Core Reactor</strong> — Center spinner</p>
                <p>🔤 <strong className="text-foreground">C-C-A Lanes</strong> — Top rollovers</p>
                <p>💥 <strong className="text-foreground">Pop Bumpers</strong> — Triangle formation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CyberPinballPage;
