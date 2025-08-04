
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

interface TriviaAdminProps {
  isAdmin: boolean;
}

export const TriviaAdmin = ({ isAdmin }: TriviaAdminProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({
    category: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    difficulty: 'medium'
  });

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions();
    }
  }, [isAdmin]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trivia_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('trivia_questions')
        .insert([newQuestion]);

      if (error) throw error;

      toast({
        title: "Question Added! ✅",
        description: "New trivia question has been added successfully",
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

      fetchQuestions();
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
      const { error } = await supabase
        .from('trivia_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Question Deleted",
        description: "Question has been removed from the database",
      });

      fetchQuestions();
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
            🔧 TRIVIA ADMIN PANEL
          </CardTitle>
          <p className="text-muted-foreground">
            Manage trivia questions and game content
          </p>
        </CardHeader>
      </Card>

      {/* Add New Question */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            ➕ ADD NEW QUESTION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Game History">Game History</SelectItem>
                <SelectItem value="Characters">Characters</SelectItem>
                <SelectItem value="Developers">Developers</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
              </SelectContent>
            </Select>

            <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion({...newQuestion, difficulty: value})}>
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
            placeholder="Enter the question..."
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

          <Select value={newQuestion.correct_answer} onValueChange={(value) => setNewQuestion({...newQuestion, correct_answer: value})}>
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
            ➕ ADD QUESTION
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            📋 QUESTION DATABASE ({questions.length} questions)
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
