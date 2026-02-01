
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { Brain, Zap, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AIGamingCoach = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { balance, refetch: refetchBalance } = useUserBalance();
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

    if (question.trim().length > 500) {
      toast({
        title: "Question Too Long",
        description: "Please keep your question under 500 characters",
        variant: "destructive",
      });
      return;
    }

    // Client-side balance check (for UX only - server validates)
    if (balance.cctr_balance < QUESTION_COST) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${QUESTION_COST} CCTR for AI coaching. Current balance: ${balance.cctr_balance}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the secured edge function - payment is handled server-side
      const { data, error } = await supabase.functions.invoke('gaming-coach', {
        body: { 
          question: question.trim(),
          wallet_address: primaryWallet.address
        }
      });

      if (error) {
        console.error('Gaming coach error:', error);
        toast({
          title: "AI Error",
          description: error.message || "Failed to get AI response",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setResponse(data.response);
      setQuestion('');
      
      // Refresh balance to show updated amount
      await refetchBalance();

      toast({
        title: "Question Processed!",
        description: `Charged ${data.cost || QUESTION_COST} CCTR for AI coaching`,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
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
          {isWalletConnected && (
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
              💰 Balance: {balance.cctr_balance} CCTR
            </Badge>
          )}
          
          <div className="flex gap-3">
            <Input
              placeholder="Ask your gaming question... (e.g., 'How to improve my aim?')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 cyber-input"
              disabled={isLoading}
              maxLength={500}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={isLoading || !question.trim() || !isWalletConnected}
              className="cyber-button"
            >
              {isLoading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <MessageCircle size={16} className="mr-2" />
              )}
              {isLoading ? 'THINKING...' : 'ASK AI'}
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
              <div className="w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center shrink-0">
                🤖
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neon-cyan mb-2">AI Gaming Coach Response:</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{response}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Sample Questions */}
        <Card className="vending-machine p-4">
          <h3 className="font-bold text-neon-pink mb-3">💡 Sample Questions:</h3>
          <div className="grid gap-2 text-sm">
            <button
              onClick={() => setQuestion("How can I improve my reaction time in FPS games?")}
              className="text-left p-2 rounded hover:bg-gray-800 transition-colors text-gray-400"
              disabled={!isWalletConnected || isLoading}
            >
              • How can I improve my reaction time in FPS games?
            </button>
            <button
              onClick={() => setQuestion("What's the best strategy for winning esports tournaments?")}
              className="text-left p-2 rounded hover:bg-gray-800 transition-colors text-gray-400"
              disabled={!isWalletConnected || isLoading}
            >
              • What's the best strategy for winning esports tournaments?
            </button>
            <button
              onClick={() => setQuestion("How do I build better team communication in competitive games?")}
              className="text-left p-2 rounded hover:bg-gray-800 transition-colors text-gray-400"
              disabled={!isWalletConnected || isLoading}
            >
              • How do I build better team communication in competitive games?
            </button>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};
