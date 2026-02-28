

# Cyber Pinball: Cannon Launch, Leaderboard, and Smart Contract Integration

## Overview
Three major additions to Cyber Pinball: a cannon-based ball launch system, a Supabase-powered leaderboard, and smart contract score submission -- all following existing patterns from Portal Breaker (Cyber Breaker).

---

## 1. Cannon Ball Launch

**Problem**: The current launch code sets position/velocity but something in the physics loop or spawn logic keeps overriding it.

**Solution**: Replace the top-left drop with a visible cannon in the top-left corner that fires the ball with a dramatic animation.

- Add a cannon body (static, visual-only) at top-left of playfield (~x:40, y:60)
- Draw a detailed cannon graphic in the render loop (barrel, base, muzzle flash on fire)
- On launch: position ball at cannon muzzle, fire at ~45-degree angle downward-right
- Add muzzle flash particles and screen shake
- Remove ALL other spawn/launch coordinate references (there are 3 duplicate locations: `spawnBall()` at line ~590, `doLaunch()` at line ~602, and `launchBall` callback at line ~1729) -- unify them to ONE cannon position
- Ball spawn coordinates: `{ x: 50, y: 70 }` (cannon muzzle)
- Launch velocity: `{ x: 8, y: 6 }` (diagonal right-downward into playfield)

## 2. Match Cyber Breaker Ball Bounce

**Current state**: CyberPinball uses Matter.js `restitution: 1.05` which handles bouncing automatically but inconsistently.

**Solution**: Add a per-frame speed normalization step (same as Cyber Breaker line 830-831) inside the render loop to keep ball speed consistent:

```text
After each frame, normalize ball velocity:
  currentSpeed = sqrt(vx^2 + vy^2)
  targetSpeed = 7 (base, matching Breaker)
  if currentSpeed > 0: scale vx and vy to targetSpeed
```

- Add speed normalization in the render loop (around line 667 where boundary clamping already happens)
- Set `restitution` to `1.0` (perfect bounce, no energy gain/loss) since speed is manually controlled
- Cap max speed at 12 (same as Breaker)
- This ensures the ball always moves at a consistent, predictable speed just like Cyber Breaker

## 3. Leaderboard (Supabase)

Following the exact Portal Breaker pattern:

**Database**: Create `pinball_scores` table via migration:
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (text, not null) -- wallet address
- `score` (integer, not null)
- `balls_used` (integer, default 3)
- `created_at` (timestamptz, default now())
- RLS: Enable, allow public insert and select (same as portal_breaker_scores)

**Component changes**:
- Import `supabase`, `useMultiWallet`, `useUserBalance` into CyberPinball
- Add `fetchLeaderboard()` and `submitScore()` callbacks (copy Portal Breaker pattern)
- Submit score on game over
- Add leaderboard toggle button and leaderboard display panel below the game canvas
- Show top 20 scores with rank badges, wallet masking, and "You" highlight

## 4. Smart Contract Integration

- Import `useMultiWallet` for wallet address
- On game over with score > 0, call `supabase.functions.invoke('submit-score')` with the wallet address, score, and `gameType: 'arcade'` (the existing edge function already supports this)
- Display earned CCC tokens in the game over screen
- Follow the same pattern already used in the platform's other games

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/games/CyberPinball.tsx` | Major: cannon launch, speed normalization, leaderboard UI, smart contract calls |
| `src/pages/CyberPinballPage.tsx` | Minor: pass wallet props if needed |
| Database migration | Create `pinball_scores` table |

## Technical Notes

- The cannon replaces the plunger lane entirely -- the plunger wall segments (lines 220-221) can remain as playfield walls
- Speed normalization runs every frame after Matter.js physics step, overriding any weird velocity from high-restitution bounces
- The three duplicate launch code paths (spawnBall, doLaunch, launchBall) will all use the same cannon coordinates
- Leaderboard follows the identical pattern as PortalBreakerGame (lines 356-374, 1998-2036)

