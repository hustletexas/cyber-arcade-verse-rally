
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useSolanaScore } from '@/hooks/useSolanaScore';
import { Brain, Zap, MessageCircle, CheckCircle } from 'lucide-react';

export const AIGamingCoach = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected, getWalletIcon } = useMultiWallet();
  const { isAuthenticating } = useWalletAuth();
  const { submitScore, isSubmitting } = useSolanaScore();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const QUESTION_COST = 10; // 10 CCTR per question

  const handleAskQuestion = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please connect your wallet to login and use AI Gaming Coach",
        variant: "destructive",
      });
      return;
    }

    if (!isWalletConnected || !primaryWallet) {
      toast({
        title: "Wallet Required", 
        description: "Please connect your wallet to pay for AI coaching",
        variant: "destructive",
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question to ask the AI coach",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Charge CCTR for the question
      const paymentResult = await submitScore(-QUESTION_COST, 'ai_coaching');
      
      if (!paymentResult.success) {
        toast({
          title: "Payment Failed",
          description: "Unable to charge CCTR for AI coaching. Check your balance.",
          variant: "destructive",
        });
        return;
      }

      // Generate AI response (simplified keyword-based for now)
      const aiResponse = generateAIResponse(question);
      setResponse(aiResponse);

      toast({
        title: "Question Processed!",
        description: `Charged ${QUESTION_COST} CCTR for AI coaching`,
      });

    } catch (error) {
      console.error('Error asking AI coach:', error);
      toast({
        title: "Error",
        description: "Failed to process your question",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('strategy') || lowerQuestion.includes('tactic')) {
      return "🎯 Gaming Strategy: Focus on positioning, map control, and resource management. Practice your aim daily and study pro player gameplay patterns.";
    } else if (lowerQuestion.includes('improve') || lowerQuestion.includes('better')) {
      return "📈 Improvement Tips: Analyze your replays, identify weaknesses, practice specific skills in training modes, and maintain consistent play schedules.";
    } else if (lowerQuestion.includes('tournament') || lowerQuestion.includes('compete')) {
      return "🏆 Tournament Prep: Study the meta, practice under pressure, maintain good mental health, and develop consistent warm-up routines.";
    } else if (lowerQuestion.includes('team') || lowerQuestion.includes('communication')) {
      return "👥 Team Play: Clear communication, defined roles, regular practice together, and positive attitude are key to team success.";
    } else if (lowerQuestion.includes('build') || lowerQuestion.includes('loadout')) {
      return "⚔️ Build Optimization: Adapt your build to the current meta, practice different configurations, and understand item synergies.";
    } else {
      return "🤖 AI Coach: Great question! Focus on consistent practice, review your gameplay, learn from mistakes, and stay updated with meta changes. Keep grinding!";
    }
  };

  // Show authentication status
  const getAuthStatus = () => {
    if (isAuthenticating) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent"></div>
          <span className="text-neon-cyan font-medium">Authenticating...</span>
        </div>
      );
    }

    if (user && isWalletConnected) {
      return (
        <>
          <CheckCircle className="w-5 h-5 text-neon-green" />
          <span className="text-neon-green font-medium">Wallet Connected & Authenticated</span>
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
            {getWalletIcon(primaryWallet?.type || 'phantom')} {primaryWallet?.address.slice(0, 8)}...
          </Badge>
        </>
      );
    }

    if (isWalletConnected && !user) {
      return (
        <>
          <div className="w-5 h-5 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent"></div>
          <span className="text-neon-cyan font-medium">Wallet Connected - Logging in...</span>
        </>
      );
    }

    return (
      <>
        <div className="w-5 h-5 rounded-full border-2 border-neon-pink"></div>
        <span className="text-neon-pink font-medium">Connect Wallet to Login</span>
      </>
    );
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          <Brain className="w-8 h-8" />
          AI GAMING COACH
          <Badge className="bg-neon-purple text-white">
            <Zap size={12} className="mr-1" />
            {QUESTION_COST} CCTR per question
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-neon-cyan/20 bg-card/50">
          <div className="flex items-center gap-2">
            {getAuthStatus()}
          </div>
          {user && isWalletConnected && (
            <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
              Ready to Ask AI
            </Badge>
          )}
        </div>

        {/* Question Input */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Ask your gaming question... (e.g., 'How to improve my aim?')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 cyber-input"
              disabled={isLoading || isSubmitting || isAuthenticating}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={isLoading || isSubmitting || !question.trim() || !user || !isWalletConnected || isAuthenticating}
              className="cyber-button"
            >
              <MessageCircle size={16} className="mr-2" />
              {isLoading || isSubmitting ? 'PROCESSING...' : 'ASK AI'}
            </Button>
          </div>

          {/* Status Messages */}
          {!isWalletConnected && (
            <p className="text-yellow-400 text-sm">⚠️ Please connect your wallet to login and use AI Gaming Coach</p>
          )}
          {isWalletConnected && !user && !isAuthenticating && (
            <p className="text-yellow-400 text-sm">⚠️ Wallet authentication in progress...</p>
          )}
        </div>

        {/* AI Response */}
        {response && (
          <Card className="holographic p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center">
                🤖
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neon-cyan mb-2">AI Gaming Coach Response:</h3>
                <p className="text-gray-300 leading-relaxed">{response}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Sample Questions */}
        <Card className="vending-machine p-4">
          <h3 className="font-bold text-neon-pink mb-3">💡 Sample Questions:</h3>
          <div className="grid gap-2 text-sm">
            <button
              onClick={() => setQuestion("How can I improve my reaction time?")}
              className="text-left p-2 rounded hover:bg-gray-800 transition-colors text-gray-400"
              disabled={isAuthenticating}
            >
              • How can I improve my reaction time?
            </button>
            <button
              onClick={() => setQuestion("What's the best strategy for tournaments?")}
              className="text-left p-2 rounded hover:bg-gray-800 transition-colors text-gray-400"
              disabled={isAuthenticating}
            >
              • What's the best strategy for tournaments?
            </button>
            <button
              onClick={() => setQuestion("How to build better team communication?")}
              className="text-left p-2 rounded hover:bg-gray-800 transition-colors text-gray-400"
              disabled={isAuthenticating}
            >
              • How to build better team communication?
            </button>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};
