# Game Mechanics Implementation

## Overview

This document describes the implemented game mechanics for the 6x12 puzzle game.

## Grid Layout

- **Playfield**: 6 columns wide × 12 rows tall
- **Spawn Position**: Pairs spawn at columns 3 and 4 (0-indexed: columns 2 and 3)
- **Game Over Condition**: Game ends when blocks in spawn columns (3 or 4) reach the top, blocking new pairs

## Block Types

### Friend Blocks

- **Types**: Rick (hamster), Coo (bird), Kine (fish)
- **Behavior**:
  - Used to sandwich other blocks
  - Eliminate when 2+ identical Friend Blocks touch horizontally or vertically
  - Do not give points when cleared

### Star Blocks

- **Behavior**:
  - Eliminated when sandwiched between identical Friend Blocks
  - Each yields 1 star for scoring
  - Can appear as bonus drops after chains

### Bomb Blocks

- **Behavior**:
  - When sandwiched, clears the entire row
  - No score given
  - Can trigger additional chains

### Hard Blocks (BRICK)

- **Behavior**:
  - Requires two sandwiches to eliminate
  - First sandwich: Block becomes "cracked"
  - Second sandwich: Block is eliminated and yields 1 star
  - Appears in harder modes

## Elimination Mechanics

### Adjacent Friend Blocks

- **Trigger**: 2+ identical Friend Blocks touching horizontally or vertically
- **Effect**: All connected identical Friend Blocks in the cluster are cleared
- **Scoring**: No points awarded

### Sandwich Patterns

- **Trigger**: Star, Bomb, or Hard Block between two identical Friend Blocks (horizontal or vertical)
- **Effects**:
  - **Star Blocks**: Cleared, yields 1 star
  - **Bomb Blocks**: Entire row cleared
  - **Hard Blocks (uncracked)**: Block becomes cracked, Friend Blocks cleared
  - **Hard Blocks (cracked)**: Block eliminated, yields 1 star, Friend Blocks cleared

## Chain System

### Chain Mechanics

1. Blocks clear after a pair lands
2. Gravity pulls blocks down to fill gaps
3. New matches are detected
4. If matches found, chain counter increments and process repeats
5. Chain continues until no more matches

### Bonus Star Drops

After chains resolve, bonus stars are dropped into the two least-filled columns:

- **Chain 2**: +2 stars
- **Chain 3**: +4 stars
- **Chain 4**: +5 stars
- **Chain 5**: +6 stars
- **Chain 6+**: +12 stars

Bonus stars can create new matches and extend chains.

## Random Row Addition (Hand/Fist)

- **Trigger**: Random chance (10%) after a pair lands and chains resolve
- **Effect**:
  - A new row of random blocks is added at the bottom
  - All existing blocks shift up one row
  - Can create or block matches
- **Composition**:
  - 15% chance per cell: Star Block
  - 30% chance per cell: Random Friend Block
  - 5% chance per cell: Hard Block
  - 50% chance per cell: Empty

## Order of Operations

When a pair lands:

1. **Lock**: Pair settles into grid
2. **Gravity**: Blocks fall to fill gaps
3. **Match Detection**:
   - Check for adjacent Friend Blocks (2+ identical touching)
   - Check for sandwich patterns (Star/Bomb/Hard between identical Friends)
4. **Special Block Resolution**:
   - Hard Blocks crack (first sandwich) or eliminate (second sandwich)
   - Bomb Blocks clear their entire row
   - Star Blocks are cleared
5. **Clear Blocks**: Matched blocks disappear
6. **Gravity**: Blocks fall again
7. **Chain Check**: If new matches found, increment chain counter and repeat steps 3-7
8. **Bonus Stars**: If chain ≥ 2, drop bonus stars into least-filled columns
9. **Hand Check**: Random chance to add a row at bottom
10. **New Pair**: If spawn columns clear, new pair spawns
11. **Game Over Check**: If spawn columns blocked, game ends

## Scoring

- **Star Blocks**: 1 point each
- **Hard Blocks (eliminated)**: 1 point each
- **Friend Blocks**: 0 points
- **Bomb Blocks**: 0 points
- **Bonus Stars**: Count toward score when cleared in subsequent chains

## Sprites

- **Rick**: `hamster.png`
- **Coo**: `bird.png`
- **Kine**: `fish.png`
- **Star**: `star.png`
- **Hard Block**: `block.png`
- **Bomb**: `block.png` (placeholder)

## Implementation Files

- **Game Engine**: `src/game/GameEngine.ts`
- **Block Types**: `src/game/BlockTypes.ts`
- **Game Board**: `src/components/GameBoard.tsx`
- **Game Loop**: `src/hooks/useGameLoop.ts`
