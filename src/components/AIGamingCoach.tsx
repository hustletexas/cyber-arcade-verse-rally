
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Sparkles, Gamepad2 } from 'lucide-react';

export const AIGamingCoach: React.FC = () => {
  const { toast } = useToast();
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
      return 'Clutch framework: isolate fights, clear angles one by one, and use sound discipline. Visualize a 3-step plan before peeking. Trade time for info—don’t rush unless utility/zone forces you.';
    }
    if (lower.includes('keybind') || lower.includes('bind')) {
      return 'Keybinds: keep movement on WASD, utility on reachable inputs without finger travel crossover. Prioritize consistency over novelty. Test one change for at least 3 sessions before judging.';
    }
    return "General tip: pick ONE focus per session (aim, positioning, or comms). Record 5 minutes of gameplay, write 3 actionable takeaways, and apply them immediately in the next match.";
  };

  const askCoach = () => {
    const q = question.trim();
    if (!q) {
      toast({ title: 'Ask something first', description: 'Type a question for your AI coach.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const a = getCoachResponse(q);
      setAnswer(a);
      setLoading(false);
      toast({ title: 'Coach ready', description: 'Strategy generated.' });
    }, 400);
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
          <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple">Beta</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-neon-pink text-sm">
              <Lightbulb size={16} />
              <span>Ask for tips on aim, strategy, mindset, or keybinds.</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your coach anything..."
                className="flex-1 bg-black/50 border-neon-cyan text-white placeholder-gray-400"
              />
              <Button
                onClick={askCoach}
                disabled={loading}
                className="min-w-[130px]"
                style={{
                  background: 'linear-gradient(45deg, #00ffcc, #0088aa)',
                  border: '1px solid #00ffcc',
                  color: 'black',
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Thinking...' : 'Ask Coach'}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p) => (
              <Button
                key={p}
                variant="outline"
                onClick={() => setQuestion(p)}
                className="border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10"
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
              <div className="text-neon-cyan font-semibold mb-2">Coach Says</div>
              <p className="text-sm leading-relaxed">{answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default AIGamingCoach;
