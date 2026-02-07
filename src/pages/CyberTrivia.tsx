import React from 'react';
import { Link } from 'react-router-dom';
import { CyberTriviaChallenge } from '@/components/cyber-trivia';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CyberTrivia = () => {
  return (
    <div className="min-h-screen bg-cyber-darker">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-neon-cyan/20">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-neon-cyan hover:text-neon-cyan/80 hover:bg-neon-cyan/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
          </Link>
        </div>
      </div>

      {/* Game Content */}
      <div className="container mx-auto px-4 py-6">
        <CyberTriviaChallenge />
      </div>
    </div>
  );
};

export default CyberTrivia;
