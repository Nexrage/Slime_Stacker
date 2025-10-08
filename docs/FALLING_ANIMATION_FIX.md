# Falling Animation Synchronization Fix

## The Problem
When rotating or shifting blocks during fall (both horizontal and vertical orientations), the falling animation was getting out of sync. Blocks would appear to lag behind or snap awkwardly because:

1. The animation was trying to animate vertical position (`translateY`)
2. When you rotate/shift, the blocks move to new grid positions
3. The animation would start from a negative offset, but the block was already mid-animation
4. This caused visual glitches: blocks appearing above/below where they should be

## The Solution
**Removed position-based animation entirely** and replaced it with visual indicators that don't affect positioning:

### New FallingWrapper Implementation

**What it does:**
- **Pulsing scale effect**: Blocks subtly grow/shrink (1.0 → 1.05 → 1.0) while falling
- **Brightness boost**: Slight opacity increase (1.1) to highlight active pieces
- **Instant position updates**: Grid positions change immediately, no lag
- **Smooth settle**: Spring animation when blocks lock into place

**Technical Details:**
```typescript
// Active falling piece
scale: withRepeat(
  withSequence(
    withTiming(1.05, { duration: 300 }),
    withTiming(1.0, { duration: 300 })
  ),
  -1, // infinite repeat
  true // reverse direction
)
brightness: 1.1

// Locked piece
scale: withSpring(1, { damping: 10, stiffness: 150 })
brightness: 1.0
```

## Results

### Before
❌ Blocks appeared to float or snap during rotation  
❌ Horizontal shifts caused visual stuttering  
❌ Vertical orientation had even worse sync issues  
❌ Animation duration (350ms) didn't match game tick (450ms)

### After
✅ **Perfectly synced**: Blocks move instantly with game logic  
✅ **Clear visual feedback**: Pulsing shows which pieces are active  
✅ **Works in all orientations**: No difference between horizontal/vertical  
✅ **Smooth on rotate/shift**: No glitches when changing position  
✅ **Performance**: Lighter animation, consistent 60fps

## Why This Works Better

1. **Separation of concerns**: 
   - Game logic controls position (instant)
   - Animation provides visual feedback (non-positional)

2. **No fighting with React state**:
   - Grid updates immediately via state
   - Animation runs independently on UI thread

3. **Always in sync**:
   - No animation duration to match with game tick
   - No accumulated timing errors

4. **Clear player feedback**:
   - Pulsing makes active piece obvious
   - Locked pieces visually distinct

## Testing Checklist
✅ Rotate while falling - no visual glitches  
✅ Shift left/right while falling - instant response  
✅ Vertical orientation rotation - smooth  
✅ Horizontal orientation rotation - smooth  
✅ Hard drop - works correctly  
✅ Soft drop - responsive  
✅ Lock animation - satisfying settle

