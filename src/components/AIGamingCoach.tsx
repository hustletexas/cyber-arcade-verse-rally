
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useSolanaScore } from '@/hooks/useSolanaScore';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { Brain, Zap, MessageCircle, CheckCircle } from 'lucide-react';

export const AIGamingCoach = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected, getWalletIcon } = useMultiWallet();
  const { submitScore, isSubmitting } = useSolanaScore();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const QUESTION_COST = 1; // 1 CCTR per question

  const handleAskQuestion = async () => {
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
      // Charge CCTR for the question via Edge Function using connected Solana wallet
      const paymentResult = await submitScore(-QUESTION_COST, 'ai_coaching');
      
      if (!paymentResult.success) {
        toast({
          title: "Payment Failed",
          description: "Unable to charge CCTR for AI coaching. Check your wallet connection.",
          variant: "destructive",
        });
        return;
      }

      // Generate AI response (simplified keyword-based for now)
      const aiResponse = generateAIResponse(question);
      setResponse(aiResponse);
      
      // Clear the question input to allow for new questions
      setQuestion('');

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
        <WalletStatusBar />

        {/* Question Input */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Ask your gaming question... (e.g., 'How to improve my aim?')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 cyber-input"
              disabled={isLoading || isSubmitting}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={isLoading || isSubmitting || !question.trim() || !isWalletConnected}
              className="cyber-button"
            >
              <MessageCircle size={16} className="mr-2" />
              {isLoading || isSubmitting ? 'PROCESSING...' : 'ASK AI'}
            </Button>
          </div>

          {/* Status Messages */}
          {!isWalletConnected && (
            <p className="text-yellow-400 text-sm">⚠️ Connect your wallet to enable AI Gaming Coach</p>
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
              disabled={!isWalletConnected}
            >
              • How can I improve my reaction time?
            </button>
            <button
              onClick={() => setQuestion("What's the best strategy for tournaments?")}
              className="text-left p-2 rounded hover:bg-gray-800 transition-colors text-gray-400"
              disabled={!isWalletConnected}
            >
              • What's the best strategy for tournaments?
            </button>
            <button
              onClick={() => setQuestion("How to build better team communication?")}
              className="text-left p-2 rounded hover:bg-gray-800 transition-colors text-gray-400"
              disabled={!isWalletConnected}
            >
              • How to build better team communication?
            </button>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};
