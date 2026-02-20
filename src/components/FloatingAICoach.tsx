import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AIGamingCoach } from './AIGamingCoach';
import { cn } from '@/lib/utils';

export const FloatingAICoach = () => {
  const [showCoach, setShowCoach] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowCoach(true)}
        className={cn(
          "fixed bottom-4 left-4 z-40 h-14 w-14 rounded-full p-0",
          "bg-neon-cyan/20 border border-neon-cyan/40 backdrop-blur-md",
          "hover:bg-neon-cyan/30 hover:scale-110 hover:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.4)]",
          "transition-all duration-300 group"
        )}
        aria-label="AI Gaming Coach"
      >
        <Bot className="h-6 w-6 text-neon-cyan group-hover:animate-pulse" />
      </Button>

      <Dialog open={showCoach} onOpenChange={setShowCoach}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-neon-cyan/30 p-0">
          <AIGamingCoach />
        </DialogContent>
      </Dialog>
    </>
  );
};
