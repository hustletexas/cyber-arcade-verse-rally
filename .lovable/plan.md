
# Evolving Enemies: Shapes, Colors, and Bullets Per Wave

## Overview
Currently, enemy shapes change every 3 waves (5 tiers), but colors and bullet patterns remain static. This plan makes enemies visually and mechanically distinct on every wave by introducing per-wave color palettes and new bullet patterns that rotate with the tiers.

---

## Changes

### 1. Wave-Based Color Palettes
Replace the static `ENEMY_META` colors with a palette system that cycles through distinct color sets based on the current wave.

**5 Color Palettes** (one per shape tier, cycling after tier 4):

| Tier | Scout | Striker | Core |
|------|-------|---------|------|
| 0 | Cyan `#00ffcc` | Amber `#f59e0b` | Pink `#ff3d7f` |
| 1 | Lime `#39ff14` | Orange `#ff6a00` | Violet `#bf00ff` |
| 2 | Ice Blue `#00d4ff` | Red `#ff2244` | Gold `#ffd700` |
| 3 | Hot Pink `#ff69b4` | Teal `#00ffa5` | Crimson `#dc143c` |
| 4 | Electric Purple `#b400ff` | Neon Yellow `#ccff00` | Deep Blue `#4466ff` |

A helper function `getEnemyColor(type, wave)` will return the correct color based on the current shape tier.

### 2. Wave-Based Bullet Patterns
Each enemy type gets **new attack patterns** that rotate with the shape tier:

**Scout** (single-shot base):
- Tier 0: Single aimed shot (current)
- Tier 1: Fast double-tap (two quick shots)
- Tier 2: Sine-wave bullet (wobbles horizontally)
- Tier 3: Boomerang shot (curves back toward player)
- Tier 4: Homing bullet (slow turn toward player)

**Striker** (spread base):
- Tier 0: 3-way spread (current)
- Tier 1: 4-way cross pattern
- Tier 2: Rotating spiral (2 bullets at spinning angles)
- Tier 3: Shotgun burst (5 tight spread)
- Tier 4: Alternating left-right volleys

**Core** (burst base):
- Tier 0: 5-way burst (current)
- Tier 1: Ring of 8 bullets
- Tier 2: Aimed triple with splash
- Tier 3: Sweeping laser (3 sequential aimed shots)
- Tier 4: Dual spiral (rotating double helix)

### 3. Bullet Rendering Variety
Enemy bullets will be color-matched to their parent enemy and have visual variation:
- Standard bullets use the enemy's current wave color
- Special patterns (sine-wave, homing) get unique trail effects

---

## Technical Details

### File: `src/components/games/CyberGalaxyGame.tsx`

**New color lookup** (added near `ENEMY_META`):
- Add `WAVE_PALETTES` array with 5 color sets
- Add `getWaveColors(wave)` helper that returns `{scout, striker, core}` colors
- Modify enemy rendering to use `getWaveColors` instead of `ENEMY_META[e.type].color`
- Update particle spawn colors to also use wave-based colors

**New bullet interface extension**:
- Add optional `color` and `pattern` fields to the `Bullet` interface (`sineWave`, `homing`, etc.)
- Sine-wave bullets: update x position each frame using `Math.sin()`
- Homing bullets: slight steering toward player each frame

**Enemy shooting refactor** (lines ~496-514):
- Replace the current type-based switch with a tier+type lookup
- Each tier/type combination calls a specific pattern function
- Pattern functions push bullets with appropriate `vx`/`vy` and `pattern` tags

**Bullet rendering update** (around line 1000):
- Enemy bullets rendered with their `.color` property instead of hardcoded magenta
- Special pattern bullets get small visual differences (size, glow intensity)

**Particle colors update**:
- All `spawnParticles` calls for enemies use `getWaveColors()` instead of `ENEMY_META[e.type].color`
