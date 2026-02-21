import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { match_id, tournament_id, screenshot_url, clip_url, match_code, session_token } = await req.json();

    // Validate inputs
    if (!match_id || !tournament_id || !screenshot_url || !session_token) {
      return new Response(
        JSON.stringify({ error: 'match_id, tournament_id, screenshot_url, and session_token are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof screenshot_url !== 'string' || screenshot_url.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Invalid screenshot URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (session_token.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid session token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the match exists and user is a participant
    const { data: match, error: matchError } = await adminClient
      .from('tournament_matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return new Response(
        JSON.stringify({ error: 'Match not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (match.player_a_id !== user.id && match.player_b_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You are not a participant in this match' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate submission
    const { data: existing } = await adminClient
      .from('match_submissions')
      .select('id')
      .eq('match_id', match_id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'You already submitted proof for this match' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for reused screenshots across matches
    const { data: reusedProof } = await adminClient
      .from('match_submissions')
      .select('id, match_id')
      .eq('screenshot_url', screenshot_url)
      .neq('match_id', match_id)
      .limit(1);

    const reusedScreenshot = reusedProof && reusedProof.length > 0;

    // AI Vision verification
    console.log('Starting AI verification for match:', match_id);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an AI Tournament Referee for a competitive gaming platform. Your job is to verify match result screenshots submitted by players.

Analyze the submitted image and determine:
1. Does it appear to be a genuine game result/score screen?
2. Is there a visible session token overlay matching the expected token?
3. Are there signs of image manipulation (mismatched fonts, blur artifacts, inconsistent lighting)?
4. Does the image metadata look consistent (resolution, format)?
5. Is the game UI style consistent with known game interfaces?

Expected session token for this match: "${session_token}"

Respond with a JSON object (no markdown):
{
  "verdict": "verified" | "needs_review" | "rejected",
  "confidence": 0-100,
  "reasons": ["reason1", "reason2"],
  "details": "brief explanation"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Verify this match proof screenshot. Match ID: ${match_id}. The session token overlay should read: ${session_token}`
              },
              {
                type: 'image_url',
                image_url: { url: screenshot_url }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    let verification = {
      verdict: 'needs_review' as string,
      confidence: 0,
      reasons: [] as string[],
    };

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || '';
      
      try {
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          verification.verdict = parsed.verdict || 'needs_review';
          verification.confidence = Math.min(100, Math.max(0, parsed.confidence || 0));
          verification.reasons = Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 10) : [];
        }
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        verification.reasons.push('AI response parsing failed - flagged for manual review');
      }
    } else {
      const errorText = await aiResponse.text();
      console.error('AI verification failed:', aiResponse.status, errorText);
      verification.reasons.push('AI service unavailable - flagged for manual review');
    }

    // Flag reused screenshots
    if (reusedScreenshot) {
      verification.verdict = 'needs_review';
      verification.reasons.push('Screenshot URL has been used in a different match submission');
      verification.confidence = Math.min(verification.confidence, 30);
    }

    // Insert the submission
    const { data: submission, error: insertError } = await adminClient
      .from('match_submissions')
      .insert({
        match_id,
        tournament_id,
        user_id: user.id,
        screenshot_url,
        clip_url: clip_url || null,
        match_code: match_code || null,
        session_token,
        verification_status: verification.verdict,
        ai_confidence: verification.confidence,
        ai_reasons: verification.reasons,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Proof verified:', { match_id, verdict: verification.verdict, confidence: verification.confidence });

    return new Response(
      JSON.stringify({
        success: true,
        submission_id: submission.id,
        verification_status: verification.verdict,
        confidence: verification.confidence,
        reasons: verification.reasons,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('verify-proof error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
