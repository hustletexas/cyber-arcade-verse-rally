

# Cyber Pinball — Complete Rebuild

## What We're Doing
Deleting the entire current `CyberPinball.tsx` (1300 lines of broken code) and replacing it with a clean, working pinball game built from the ground up. The page wrapper (`CyberPinballPage.tsx`) stays as-is since it's fine.

## New Design — "Demon's Tilt meets Cyber City"

A vertically scrolling-style pinball table with a neon cyberpunk aesthetic. The focus is on **actually working physics** first, visual flair second.

### Core Architecture (single file: `CyberPinball.tsx`)

**Phase 1 — Working foundation (non-negotiable)**
- Matter.js engine with proper gravity, timing, and cleanup
- Ball spawns static in plunger lane, launches on Space (hold to charge, release to fire) or slider + button
- Two flippers with proper pivot constraints (Arrow keys / Z / M)
- Solid walls, plunger lane separator, drain with ball-loss detection
- Score HUD, ball count, game over screen with restart
- All canvas rendering wrapped in numeric safety helpers (`fin`, `sn`, `radGrad`) to prevent crashes

**Phase 2 — Table elements**
- 3 pop bumpers (circular, high restitution) — 100 pts each
- 2 slingshots (triangular kickers near flippers) — 50 pts
- 5 drop targets spelling C-Y-B-E-R — 200 pts each, complete set = 5000 bonus
- 2 orbit lanes (left/right return lanes) — 300 pts, consecutive = combo multiplier
- 1 center ramp sensor — 500 pts, locks balls for multiball

**Phase 3 — Modes**
- Combo system: hits within 3 seconds chain, multiplier up to 5x
- Reactor charge: bumper hits fill a meter, 100% = Overdrive (2x scoring for 15s)
- Demon Mode: clear both drop target banks = 3x scoring for 20s
- Multiball: lock 2 balls = release 3 balls

**Phase 4 — Visuals**
- Dark city background with simple building silhouettes (rectangles, no gradients that can crash)
- Neon glow on bumpers/flippers using safe gradient helpers
- Ball trail (last 8 positions)
- Screen shake on bumper hits
- Particle bursts on scoring events
- All visual effects are optional — if any value is non-finite, skip that frame's effect entirely

### Key Technical Decisions

1. **Ball launch**: Ball spawns `isStatic: true`. On launch, `Body.setStatic(ball, false)` then `Body.applyForce` with clamped power. Minimum force = 0.015 (guarantees clearing the lane).

2. **Flipper physics**: Each flipper is a rectangle body with a `Constraint` pinning one end. Flipper activation sets angular velocity. On release, gravity returns it. No `Body.setAngle` — pure physics.

3. **Drain detection**: `Events.on(engine, 'beforeUpdate')` checks if ball.position.y > TH + 20. Removes ball, decrements count, respawns after 1s delay.

4. **Crash prevention**: Every single `ctx.createRadialGradient`, `ctx.createLinearGradient`, `ctx.arc`, and coordinate-dependent draw call goes through safety wrappers. If invalid, that draw call is silently skipped.

5. **Recovery**: Each frame checks ball position. If NaN/Infinity, remove ball from world, respawn fresh.

### File Changes
- **Replace**: `src/components/games/CyberPinball.tsx` — complete rewrite (~800 lines, focused and clean)
- **No changes**: `src/pages/CyberPinballPage.tsx` — wrapper is fine as-is

