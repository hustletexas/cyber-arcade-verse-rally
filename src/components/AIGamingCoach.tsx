
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useSolanaScore } from '@/hooks/useSolanaScore';
import { Lightbulb, Sparkles, Gamepad2, Coins, Wallet } from 'lucide-react';

const QUESTION_COST_CCTR = 10; // Cost per question in CCTR tokens

export const AIGamingCoach: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { balance, refetch: refetchBalance } = useUserBalance();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { submitScore } = useSolanaScore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = useMemo(
    () => [
      'How do I improve my aim?',
      'Best warm-up before a tournament?',
      'How to manage tilt and stay focused?',
      'Tips for clutch situations',
      'Optimize keybinds for faster reaction',
    ],
    []
  );

  const canAffordQuestion = user && balance.cctr_balance >= QUESTION_COST_CCTR;

  const getCoachResponse = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('aim')) {
      return 'Aim training tip: practice short 10–15 min routines focusing on micro-corrections. Track first, then click. Lower your sensitivity slightly and enable raw input. Do 3 sets: (1) line tracking, (2) target switching, (3) micro-flicks.';
    }
    if (lower.includes('warm') || lower.includes('tournament')) {
      return 'Warm-up plan (12 min): 5 min mechanical drills, 4 min movement routes, 3 min decision-making (watch 1 round, call plays). Hydrate, breathe box pattern (4-4-4-4), and set 1 clear goal for the match.';
    }
    if (lower.includes('tilt') || lower.includes('focus')) {
      return 'Anti-tilt routine: pause after losses, label the mistake once, commit to one fix next round. Use a 3-breath reset, relax shoulders, and lower screen brightness slightly to reduce fatigue.';
    }
    if (lower.includes('clutch')) {
      return 'Clutch framework: isolate fights, clear angles one by one, and use sound discipline. Visualize a 3-step plan before peeking. Trade time for info—don't rush unless utility/zone forces you.';
    }
    if (lower.includes('keybind') || lower.includes('bind')) {
      return 'Keybinds: keep movement on WASD, utility on reachable inputs without finger travel crossover. Prioritize consistency over novelty. Test one change for at least 3 sessions before judging.';
    }
    return "General tip: pick ONE focus per session (aim, positioning, or comms). Record 5 minutes of gameplay, write 3 actionable takeaways, and apply them immediately in the next match.";
  };

  const processPayment = async () => {
    if (!user || !isWalletConnected) {
      return false;
    }

    try {
      // Deduct CCTR tokens for the question
      const result = await submitScore(-QUESTION_COST_CCTR, 'ai_coach_payment');
      
      if (result.success) {
        await refetchBalance();
        return true;
      } else {
        throw new Error('Failed to process CCTR payment');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  };

  const askCoach = async () => {
    const q = question.trim();
    if (!q) {
      toast({ title: 'Ask something first', description: 'Type a question for your AI coach.' });
      return;
    }

    if (!user) {
      toast({ 
        title: 'Login Required', 
        description: 'Please log in to ask the AI Gaming Coach questions.',
        variant: 'destructive'
      });
      return;
    }

    if (!isWalletConnected) {
      toast({ 
        title: 'Wallet Required', 
        description: 'Please connect your wallet to pay for AI coach questions.',
        variant: 'destructive'
      });
      return;
    }

    if (!canAffordQuestion) {
      toast({ 
        title: 'Insufficient CCTR', 
        description: `You need ${QUESTION_COST_CCTR} CCTR tokens to ask a question. Current balance: ${balance.cctr_balance}`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Process payment first
      const paymentSuccess = await processPayment();
      
      if (!paymentSuccess) {
        throw new Error('Payment failed');
      }

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const a = getCoachResponse(q);
      setAnswer(a);
      
      toast({ 
        title: '🎯 Coach Ready', 
        description: `Strategy generated! ${QUESTION_COST_CCTR} CCTR deducted.`
      });

      // Clear the question after successful processing
      setQuestion('');
      
    } catch (error) {
      console.error('Coach question error:', error);
      toast({ 
        title: 'Question Failed', 
        description: 'Failed to process your question. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full">
      <Card
        className="overflow-hidden"
        style={{
          background: '#0f0f0f',
          border: '2px solid #00ffcc',
          borderRadius: '12px',
          boxShadow: '0 0 20px #00ffcc30, 0 0 40px #ff00ff20, inset 0 0 20px #00ffcc05',
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-neon-cyan" size={20} />
            <CardTitle className="text-neon-cyan font-display text-xl md:text-2xl">
              AI Gaming Coach
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple">
              {QUESTION_COST_CCTR} CCTR per question
            </Badge>
            {user && (
              <Badge className={`${canAffordQuestion ? 'bg-neon-green' : 'bg-red-500'} text-black`}>
                <Coins size={14} className="mr-1" />
                {balance.cctr_balance} CCTR
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user && (
            <div className="p-4 rounded-lg border border-neon-pink/40 bg-neon-pink/10">
              <div className="flex items-center gap-2 text-neon-pink mb-2">
                <Wallet size={16} />
                <span className="font-semibold">Authentication Required</span>
              </div>
              <p className="text-sm text-gray-300">
                Please log in and connect your wallet to use the AI Gaming Coach. Each question costs {QUESTION_COST_CCTR} CCTR tokens.
              </p>
            </div>
          )}

          {user && !isWalletConnected && (
            <div className="p-4 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10">
              <div className="flex items-center gap-2 text-neon-cyan mb-2">
                <Wallet size={16} />
                <span className="font-semibold">Wallet Connection Required</span>
              </div>
              <p className="text-sm text-gray-300">
                Please connect your wallet to pay for AI coach questions with CCTR tokens.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-neon-pink text-sm">
              <Lightbulb size={16} />
              <span>Ask for tips on aim, strategy, mindset, or keybinds.</span>
              {user && (
                <span className="text-neon-purple">
                  • Cost: {QUESTION_COST_CCTR} CCTR per question
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your coach anything..."
                className="flex-1 bg-black/50 border-neon-cyan text-white placeholder-gray-400"
                disabled={loading || !user || !isWalletConnected}
              />
              <Button
                onClick={askCoach}
                disabled={loading || !canAffordQuestion || !user || !isWalletConnected}
                className="min-w-[130px]"
                style={{
                  background: canAffordQuestion && user && isWalletConnected 
                    ? 'linear-gradient(45deg, #00ffcc, #0088aa)' 
                    : 'linear-gradient(45deg, #666, #444)',
                  border: '1px solid #00ffcc',
                  color: canAffordQuestion && user && isWalletConnected ? 'black' : 'gray',
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Processing...' : `Ask (${QUESTION_COST_CCTR} CCTR)`}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p) => (
              <Button
                key={p}
                variant="outline"
                onClick={() => setQuestion(p)}
                disabled={loading || !user || !isWalletConnected}
                className="border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10 disabled:opacity-50"
              >
                <Gamepad2 size={14} className="mr-1" />
                {p}
              </Button>
            ))}
          </div>

          {answer && (
            <div
              className="p-4 rounded-lg border bg-black/40 text-gray-200"
              style={{ borderColor: '#00ffcc50', boxShadow: '0 0 10px #00ffcc15' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-neon-cyan font-semibold">Coach Says</div>
                <div className="text-xs text-neon-purple">
                  Powered by CCTR Smart Contract
                </div>
              </div>
              <p className="text-sm leading-relaxed">{answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default AIGamingCoach;
