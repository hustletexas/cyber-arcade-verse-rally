import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Send, X, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const FloatingSupportAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! 👋 I'm the CyberCity Support Agent. Ask me about tournaments, wallets, payouts, game rules, or anything else!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-support', {
        body: { messages: newMessages.slice(1) }, // skip initial greeting
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error('Support error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble right now. Please try again or create a support ticket." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async () => {
    if (!ticketSubject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setIsLoading(true);
    try {
      // Build description from chat history
      const chatSummary = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('ai-support', {
        body: {
          action: 'create_ticket',
          ticket_data: {
            subject: ticketSubject.slice(0, 200),
            description: chatSummary.slice(0, 2000) || ticketSubject,
            category: ticketCategory,
            ai_summary: messages[messages.length - 1]?.content?.slice(0, 500),
          },
        },
      });

      if (error) throw error;

      toast.success('Support ticket created! We\'ll get back to you soon.');
      setShowTicketForm(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ Ticket created (ID: ${data.ticket_id?.slice(0, 8)}...). A human agent will review your issue. You'll hear back soon!` 
      }]);
    } catch (err) {
      console.error('Ticket error:', err);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 left-4 z-40 h-14 w-14 rounded-full p-0",
          "bg-neon-pink/20 border border-neon-pink/40 backdrop-blur-md",
          "hover:bg-neon-pink/30 hover:scale-110 hover:shadow-[0_0_20px_hsl(var(--neon-pink)/0.4)]",
          "transition-all duration-300 group"
        )}
        aria-label="Support Agent"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-neon-pink" />
        ) : (
          <Headphones className="h-6 w-6 text-neon-pink group-hover:animate-pulse" />
        )}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 z-40 w-80 sm:w-96 max-h-[70vh] flex flex-col rounded-xl border border-neon-pink/30 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 p-3 border-b border-border bg-neon-pink/5">
            <Headphones className="w-5 h-5 text-neon-pink" />
            <div className="flex-1">
              <h3 className="font-display text-sm text-neon-pink">Support Agent</h3>
              <p className="text-[10px] text-muted-foreground">Powered by AI • Free</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowTicketForm(!showTicketForm)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-neon-cyan"
            >
              <Ticket className="w-3 h-3 mr-1" />
              Ticket
            </Button>
          </div>

          {/* Ticket Form */}
          {showTicketForm && (
            <div className="p-3 border-b border-border bg-background/50 space-y-2">
              <Input
                placeholder="Ticket subject..."
                value={ticketSubject}
                onChange={e => setTicketSubject(e.target.value)}
                className="h-8 text-xs"
              />
              <select
                value={ticketCategory}
                onChange={e => setTicketCategory(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="general">General</option>
                <option value="tournament">Tournament</option>
                <option value="payout">Payout</option>
                <option value="wallet">Wallet</option>
                <option value="pass">NFT Pass</option>
                <option value="bug">Bug Report</option>
                <option value="other">Other</option>
              </select>
              <Button
                size="sm"
                onClick={createTicket}
                disabled={isLoading || !ticketSubject.trim()}
                className="w-full h-7 text-xs bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan"
              >
                {isLoading ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[400px]">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                  msg.role === 'user' 
                    ? 'bg-neon-cyan/20 text-foreground' 
                    : 'bg-muted text-foreground'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-neon-pink" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-border">
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="h-8 text-xs flex-1"
                disabled={isLoading}
                maxLength={500}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 p-0 bg-neon-pink/20 border border-neon-pink/40"
              >
                <Send className="w-3 h-3 text-neon-pink" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
