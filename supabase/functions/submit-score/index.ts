import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.78.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Maximum score bounds per game type
const SCORE_LIMITS: Record<string, { min: number; max: number; maxTokens: number }> = {
  trivia: { min: 0, max: 1000, maxTokens: 100 },
  arcade: { min: 0, max: 100000, maxTokens: 500 },
  tournament: { min: 0, max: 50000, maxTokens: 1000 },
  default: { min: 0, max: 10000, maxTokens: 100 },
}

// Rate limit tracking (in-memory, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // max submissions per window
const RATE_WINDOW = 60000 // 1 minute in ms

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false
  }
  
  userLimit.count++
  return true
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header provided')
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('Authentication failed:', authError?.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      console.log(`Rate limit exceeded for user ${user.id}`)
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // Parse and validate input
    const body = await req.json()
    const { playerPubkey, score, gameType = 'default' } = body

    // Validate playerPubkey format
    if (!playerPubkey || typeof playerPubkey !== 'string' || playerPubkey.length < 32 || playerPubkey.length > 64) {
      console.log('Invalid playerPubkey format:', playerPubkey)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid wallet address format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate score
    if (typeof score !== 'number' || !Number.isInteger(score) || isNaN(score)) {
      console.log('Invalid score type:', typeof score, score)
      return new Response(
        JSON.stringify({ success: false, error: 'Score must be a valid integer' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate gameType
    if (typeof gameType !== 'string' || gameType.length > 50) {
      console.log('Invalid gameType:', gameType)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid game type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get score limits for this game type
    const limits = SCORE_LIMITS[gameType] || SCORE_LIMITS.default

    // Validate score is within bounds
    if (score < limits.min || score > limits.max) {
      console.log(`Score ${score} out of bounds for game type ${gameType} (${limits.min}-${limits.max})`)
      return new Response(
        JSON.stringify({ success: false, error: `Score must be between ${limits.min} and ${limits.max}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Validated score submission:', { userId: user.id, playerPubkey, score, gameType })

    // Validate the Solana public key format
    let playerPublicKey: PublicKey
    try {
      playerPublicKey = new PublicKey(playerPubkey)
    } catch (e) {
      console.log('Invalid Solana public key:', playerPubkey)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid Solana wallet address' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calculate tokens earned with caps
    const rawTokens = Math.floor(score / 10)
    const tokensEarned = Math.min(rawTokens, limits.maxTokens)
    
    // Generate mock transaction hash (in production, this would be real)
    const mockTxHash = `score_${user.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`User ${user.id}: Score ${score} -> ${tokensEarned} tokens (capped from ${rawTokens})`)

    // In a real implementation, you would:
    // 1. Verify the score against a game session stored server-side
    // 2. Check for duplicate submissions
    // 3. Create an actual Solana transaction

    return new Response(
      JSON.stringify({
        success: true,
        txHash: mockTxHash,
        tokensEarned,
        playerPubkey: playerPublicKey.toString(),
        score,
        gameType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing score submission:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process score submission'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
