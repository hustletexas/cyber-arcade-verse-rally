

# Cyber Spinball 3D — Retro Arcade Pinball

## Vision
A **3D retro-styled pinball game** inspired by Sonic Spinball and classic 90s pinball, set in the Cyber City arcade universe. Uses **React Three Fiber** for 3D rendering with a tilted top-down camera angle, flat-shaded retro geometry (no photorealism), and neon glow effects. Physics handled by **Matter.js** (2D physics projected into the 3D scene).

The aesthetic is chunky polygonal shapes, scanline overlays, CRT-style bloom — think "what if a Genesis game ran in 3D."

## Architecture

### Approach: 2D Physics + 3D Rendering
- Matter.js handles all collision/physics in 2D (proven, stable)
- React Three Fiber renders the table and objects in 3D using the 2D positions
- Camera is fixed at a ~60-degree angle looking down the table, giving the classic pinball perspective
- All game objects are simple 3D primitives (boxes, cylinders, spheres) with emissive neon materials

### File Structure
- **Delete**: `src/components/games/CyberPinball.tsx` (1300 lines of broken 2D canvas code)
- **Create**: `src/components/games/cyber-pinball/CyberPinballGame.tsx` — main game component with Matter.js engine + R3F scene
- **Create**: `src/components/games/cyber-pinball/PinballTable.tsx` — 3D table geometry (walls, ramps, lanes)
- **Create**: `src/components/games/cyber-pinball/PinballObjects.tsx` — bumpers, flippers, ball, targets
- **Create**: `src/components/games/cyber-pinball/PinballHUD.tsx` — score overlay, ball count, combo display
- **Create**: `src/components/games/cyber-pinball/pinballPhysics.ts` — Matter.js setup, collision handlers, game logic
- **Update**: `src/pages/CyberPinballPage.tsx` — point import to new component
- **Update**: `src/components/CyberGamesSection.tsx` — re-add pinball card to game grid

### New Dependency
- `@react-three/fiber@^8.18` and `@react-three/drei@^9.122.0` and `three@^0.133` for 3D rendering

## Game Design

### Table Layout (Sonic Spinball inspired)
- **Bottom**: Two flippers with drain gap, slingshot kickers on each side
- **Mid-field**: 3 pop bumpers in triangle formation, "CYBER" drop target bank (5 targets)
- **Upper**: Orbit loop lanes (left/right), ramp to upper platform
- **Plunger lane**: Right side, spring launcher

### Controls
- **Space**: Hold to charge plunger, release to launch
- **Left Arrow / Z**: Left flipper
- **Right Arrow / M**: Right flipper
- **Mobile**: On-screen flipper buttons + launch slider

### Scoring
- Pop bumpers: 100 pts
- Slingshots: 50 pts
- Drop targets: 200 pts each, full CYBER set = 5,000 bonus
- Orbit lanes: 300 pts, consecutive = combo multiplier (up to 5x)
- Ramp shot: 500 pts
- Skill shot (launch into top lane): 3,000 pts

### Modes
- **Overdrive**: Fill reactor meter via bumper hits, 100% = 2x scoring for 15s
- **Demon Mode**: Clear all drop targets twice = 3x scoring for 20s
- **Multiball**: Lock 2 balls via ramp = release 3 balls

### Retro 3D Visuals
- Flat-shaded low-poly geometry (MeshStandardMaterial with flatShading)
- Neon emissive materials on bumpers, flippers, rails (cyan, pink, purple)
- Dark metallic table surface with grid lines
- Ball has a chrome/metallic look with environment reflections
- Simple particle effects on hits (instanced meshes, not canvas)
- Subtle CRT scanline overlay via a post-processing pass or CSS
- City skyline silhouettes as backdrop geometry behind the table

### Stability Guarantees
- All physics values validated before applying to 3D transforms
- Ball recovery: if position becomes NaN/Infinity, respawn automatically
- Minimum launch force ensures ball always clears the lane
- Flipper physics use constraints + angular velocity (no manual angle hacks)
- 3D render is completely decoupled from physics — if physics glitches, scene just holds last valid frame

## Technical Details

### `pinballPhysics.ts`
- Creates Matter.js engine with gravity {x: 0, y: 1.2}
- Builds all static bodies (walls, bumpers, targets, lanes)
- Flipper bodies with pivot constraints
- Collision event handler that maps body labels to scoring/game logic
- Exposes: `createEngine()`, `launchBall(power)`, `activateFlipper(side)`, `releaseFlipper(side)`, `getGameState()`, `cleanup()`

### `CyberPinballGame.tsx`
- React component wrapping a `<Canvas>` from R3F
- Runs Matter.js engine in `useFrame` loop
- Reads body positions each frame, updates 3D object positions via refs
- Manages game state (score, balls, modes) via refs for performance
- Keyboard/touch event listeners for controls
- HUD overlay positioned absolutely over the canvas

### `PinballTable.tsx`
- R3F component rendering table surface, walls, lane guides as `<mesh>` elements
- Static geometry — no per-frame updates needed
- Uses `<meshStandardMaterial>` with dark colors and subtle metallic finish

### `PinballObjects.tsx`
- Dynamic objects: ball (sphere), flippers (rounded boxes), bumpers (cylinders)
- Each reads position from physics refs in `useFrame`
- Bumpers flash emissive color on hit
- Ball leaves a short trail (last 5 positions rendered as fading spheres)

### `PinballHUD.tsx`
- HTML overlay (not 3D) showing score, ball count, combo multiplier, mode status
- Game over screen with final score and restart button
- Styled with existing Tailwind classes to match arcade theme

