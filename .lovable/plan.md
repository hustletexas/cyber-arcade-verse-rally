
# Fix Cyber Pinball Launch — Ball Never Fires

## What's Wrong
The ball spawns but can never be launched because:
- Pressing Space does nothing (no charging logic was added)
- The LAUNCH button is disabled unless the slider is above 0%
- Even if launched, the force (0.008) is too weak to clear the plunger lane

## Fix Summary
Four targeted edits to `src/components/games/CyberPinball.tsx`:

### 1. Add plunger charging in the render loop (~line 492)
After the timer checks, add logic so holding Space increments power each frame:
```
if (g.plungerCharging && g.currentBall && !g.launched) {
  g.plungerPower = Math.min(g.plungerPower + 0.015, 1);
  setPlungerDisplay(g.plungerPower);
}
```

### 2. Start charging on Space keyDown (~line 1079)
Inside the Space/ArrowDown handler, after the game-over reset block, add:
```
if (!g.gameOver && g.currentBall && !g.launched) {
  g.plungerCharging = true;
}
```

### 3. Increase base launch force (lines 1121 and 1152)
Change `0.008` to `0.014` in both the keyboard keyUp handler and the `launchBall` callback so even a 0% power tap gets the ball into play.

### 4. Remove plungerDisplay === 0 guard (lines 1250 and 1276)
Remove `plungerDisplay === 0` from both LAUNCH button `disabled` conditions, allowing instant-tap launches.

## Files Changed
- `src/components/games/CyberPinball.tsx` (4 edits, all surgical line changes)

## Expected Result
- **Space bar**: Hold to charge (slider fills visually), release to fire
- **Slider + Button**: Drag slider to desired power, tap LAUNCH (or tap LAUNCH at 0% for minimum-power shot)
- **Mobile**: Same slider + LAUNCH button flow
- Ball reliably enters the playfield on every launch
