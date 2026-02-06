import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CyberTriviaChallenge } from '@/components/cyber-trivia';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const CyberTrivia = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cyber-darker">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-neon-cyan/20">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-neon-cyan hover:text-neon-cyan/80 hover:bg-neon-cyan/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
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
