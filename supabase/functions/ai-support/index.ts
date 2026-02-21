import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const KNOWLEDGE_BASE = `
# CyberCity Arcade - Support Knowledge Base

## Wallet & Authentication
- Users connect via Stellar wallets (LOBSTR, xBull, Freighter)
- Magic Link email auth is primary for profiles and tournaments
- Wallet address is linked to profile after connecting
- If wallet won't connect on mobile, try LOBSTR app or xBull app
- Desktop users can use Freighter browser extension

## CCC (CyberCity Credits) Token
- CCC is the in-platform currency used for game entries, purchases, and rewards
- New users get 10 CCC starter bonus
- Earn CCC through games, leaderboards, radio milestones, and tournaments
- CCC can be used to buy songs, NFTs, and enter tournaments
- Check balance in the top bar after connecting wallet

## Tournaments
- Tournaments use single/double elimination, round robin, or swiss format
- Entry fees can be in USD or USDC
- Prize pools are distributed based on payout schema (winner-takes-all, top 3, top 5, etc.)
- Players must register before the deadline
- Match results require proof submission (screenshot + session token)
- AI Referee verifies proof before rewards are claimable
- Disputes can be filed if results seem incorrect

## USDC Payouts
- Tournament winnings are paid in USDC on Stellar network
- You need a USDC trustline on your Stellar wallet
- To add USDC trustline in LOBSTR: Settings > Assets > Search "USDC" > Add
- Payouts are processed after tournament completion and verification
- Contact support if payout is delayed more than 48 hours

## Games
- Cyber Match: Memory card matching game
- Trivia: Knowledge quiz with categories and streaks
- Cyber Sequence: Pattern memory game
- Portal Breaker: Brick-breaking arcade game
- CyberDrop: Daily reward drop (1 free play per day)
- DJ Booth: Mix tracks and earn milestone rewards

## Radio & Streaks
- Listen to radio to build streaks and earn CCC
- Tiers: Bronze (0-6 days), Silver (7-13), Gold (14-29), Diamond (30+)
- Milestones reward CCC for streak and listening hours

## NFT Pass System
- Some tournaments require an NFT pass (Bronze, Silver, Gold, Platinum)
- Passes can be purchased or earned
- Pass tier determines tournament access

## Common Issues
- "Insufficient balance": You need more CCC. Play games or purchase tokens.
- "Wallet not found": Connect your wallet first, then try again.
- "Rate limit exceeded": Wait a few minutes and try again.
- "Tournament full": Registration is capped. Try another tournament.
- "Payout pending": Payouts are processed within 48 hours after verification.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const { messages, action, ticket_data } = await req.json();

    // Optional auth - support works for anonymous users too
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    // Handle ticket creation
    if (action === 'create_ticket' && ticket_data) {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Login required to create tickets' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const adminClient = createClient(supabaseUrl, serviceKey);

      const subject = String(ticket_data.subject || '').slice(0, 200);
      const description = String(ticket_data.description || '').slice(0, 2000);
      const category = ['general', 'tournament', 'payout', 'wallet', 'pass', 'bug', 'other']
        .includes(ticket_data.category) ? ticket_data.category : 'general';

      const { data: ticket, error: ticketError } = await adminClient
        .from('support_tickets')
        .insert({
          user_id: userId,
          subject,
          description,
          category,
          ai_summary: ticket_data.ai_summary?.slice(0, 500) || null,
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Ticket creation error:', ticketError);
        return new Response(
          JSON.stringify({ error: 'Failed to create ticket' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, ticket_id: ticket.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chat with AI support
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit message history
    const recentMessages = messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content).slice(0, 1000),
    }));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are the CyberCity Arcade Support Agent. You help players with questions about the platform, tournaments, wallets, payouts, games, and troubleshooting.

RULES:
- ONLY answer using the knowledge base below. If you don't know, say "I'm not sure about that. Would you like me to create a support ticket for a human agent?"
- Be friendly, concise, and use gaming-appropriate language
- Use emojis sparingly for personality
- If the user's issue requires human intervention (payout problems, account issues, disputes), suggest creating a support ticket
- Never make up information about features that don't exist
- Format responses with markdown for readability

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}

AVAILABLE ACTIONS (mention these when relevant):
- "Create Support Ticket" - for issues needing human review
- "Contact Human Agent" - for urgent payout or account issues`
          },
          ...recentMessages,
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI support error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Support service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ response: aiResponse || 'Sorry, I could not generate a response.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ai-support error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
