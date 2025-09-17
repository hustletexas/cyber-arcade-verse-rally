
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LoadingText } from '@/components/ui/loading-states';
import { ErrorDisplay } from '@/components/ui/error-handling';
import { TriviaQuestion } from '@/types/trivia';

interface TriviaAdminProps {
  isAdmin: boolean;
}

export const TriviaAdmin = ({ isAdmin }: TriviaAdminProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({
    category: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions();
    }
  }, [isAdmin]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Since the database tables don't exist yet, we'll use mock data
      const mockQuestions: TriviaQuestion[] = [
        {
          id: '1',
          category: 'nintendo64',
          question: 'What was the first 3D Mario game on Nintendo 64?',
          option_a: 'Super Mario 64',
          option_b: 'Mario Kart 64',
          option_c: 'Super Mario World',
          option_d: 'Mario Party',
          correct_answer: 'A',
          difficulty: 'easy',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setQuestions(mockQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!isAdmin) return;

    try {
      // Mock adding question - in real implementation this would use Supabase
      const mockQuestion: TriviaQuestion = {
        id: Date.now().toString(),
        ...newQuestion,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setQuestions(prev => [mockQuestion, ...prev]);

      toast({
        title: "Question Added! ✅",
        description: "New gaming trivia question has been added successfully",
      });

      // Reset form
      setNewQuestion({
        category: '',
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        difficulty: 'medium'
      });
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!isAdmin) return;

    try {
      setQuestions(prev => prev.filter(q => q.id !== questionId));

      toast({
        title: "Question Deleted",
        description: "Question has been removed from the database",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card className="arcade-frame">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-neon-cyan">Access Denied</h3>
            <p className="text-muted-foreground">Admin privileges required</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-purple">
            🔧 GAMING TRIVIA ADMIN PANEL
          </CardTitle>
          <p className="text-muted-foreground">
            Manage gaming trivia questions and console content
          </p>
        </CardHeader>
      </Card>

      {/* Add New Question */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            ➕ ADD NEW GAMING QUESTION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select gaming category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nintendo64">Nintendo 64</SelectItem>
                <SelectItem value="playstation1">PlayStation 1</SelectItem>
                <SelectItem value="playstation2">PlayStation 2</SelectItem>
                <SelectItem value="xbox">Original Xbox</SelectItem>
                <SelectItem value="gamecube">GameCube</SelectItem>
                <SelectItem value="retro">Retro Gaming</SelectItem>
                <SelectItem value="arcade">Arcade Classics</SelectItem>
                <SelectItem value="pc-gaming">PC Gaming</SelectItem>
                <SelectItem value="nintendo-handheld">Nintendo Handhelds</SelectItem>
              </SelectContent>
            </Select>

            <Select value={newQuestion.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewQuestion({...newQuestion, difficulty: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Enter the gaming question..."
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Option A"
              value={newQuestion.option_a}
              onChange={(e) => setNewQuestion({...newQuestion, option_a: e.target.value})}
            />
            <Input
              placeholder="Option B"
              value={newQuestion.option_b}
              onChange={(e) => setNewQuestion({...newQuestion, option_b: e.target.value})}
            />
            <Input
              placeholder="Option C"
              value={newQuestion.option_c}
              onChange={(e) => setNewQuestion({...newQuestion, option_c: e.target.value})}
            />
            <Input
              placeholder="Option D"
              value={newQuestion.option_d}
              onChange={(e) => setNewQuestion({...newQuestion, option_d: e.target.value})}
            />
          </div>

          <Select value={newQuestion.correct_answer} onValueChange={(value: 'A' | 'B' | 'C' | 'D') => setNewQuestion({...newQuestion, correct_answer: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select correct answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={addQuestion}
            className="cyber-button w-full"
            disabled={!newQuestion.category || !newQuestion.question || !newQuestion.option_a}
          >
            ➕ ADD GAMING QUESTION
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            📋 GAMING QUESTION DATABASE ({questions.length} questions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-4">🔄</div>
              <p className="text-muted-foreground">Loading questions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="holographic p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex gap-2">
                          <Badge className="bg-neon-cyan text-black">
                            {question.category}
                          </Badge>
                          <Badge className={`${
                            question.difficulty === 'easy' ? 'bg-neon-green' :
                            question.difficulty === 'medium' ? 'bg-neon-cyan' : 'bg-neon-pink'
                          } text-black`}>
                            {question.difficulty}
                          </Badge>
                        </div>
                        
                        <h4 className="font-bold text-neon-cyan">{question.question}</h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-neon-green/20 border border-neon-green' : 'bg-gray-800/30'}`}>
                            A: {question.option_a}
                          </div>
                          <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-neon-green/20 border border-neon-green' : 'bg-gray-800/30'}`}>
                            B: {question.option_b}
                          </div>
                          <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-neon-green/20 border border-neon-green' : 'bg-gray-800/30'}`}>
                            C: {question.option_c}
                          </div>
                          <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-neon-green/20 border border-neon-green' : 'bg-gray-800/30'}`}>
                            D: {question.option_d}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => deleteQuestion(question.id)}
                        variant="destructive"
                        size="sm"
                        className="ml-4"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
