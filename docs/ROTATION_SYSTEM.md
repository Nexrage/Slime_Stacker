# 4-Way Rotation System

## Problem

Previously, the rotation system only toggled between 2 states (horizontal and vertical), which meant a pair like [Rick, Coo] would only show:

1. Rick-Coo (horizontal)
2. Rick over Coo (vertical)

This is only 2 of the 4 possible orientations!

## Solution

Implemented a full 4-way rotation system that cycles through all permutations:

### Rotation States

**Rotation 0**: Horizontal [Cell 0, Cell 1]

```
[0][1]
```

**Rotation 1**: Vertical [Cell 0 top, Cell 1 bottom]

```
[0]
[1]
```

**Rotation 2**: Horizontal [Cell 1, Cell 0] (reversed)

```
[1][0]
```

**Rotation 3**: Vertical [Cell 1 top, Cell 0 bottom]

```
[1]
[0]
```

### Example with Rick and Coo

Starting with cells = [Rick, Coo]:

- **Rotation 0**: `Rick-Coo` (horizontal)
- **Rotation 1**: `Rick` over `Coo` (vertical)
- **Rotation 2**: `Coo-Rick` (horizontal, reversed)
- **Rotation 3**: `Coo` over `Rick` (vertical, reversed)

## Implementation Details

### Type Changes

**FallingPair Type:**

```typescript
export type FallingPair = {
  cells: [BlockType, BlockType];
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical';
  rotation: 0 | 1 | 2 | 3; // New field
};
```

### Updated Functions

**pairPositions():**

- Now returns `{ x: number; y: number; blockIndex: number }[]`
- `blockIndex` indicates which cell from the pair goes in each position
- Handles all 4 rotation states

**rotatePair():**

- Cycles through rotations: `(rotation + 1) % 4`
- Updates both `orientation` and `rotation` fields
- Maintains wall-kick behavior
- Validates placement before applying rotation

**lockPair() & overlayPair():**

- Updated to use `blockIndex` to correctly place blocks
- Ensures blocks appear in the correct positions based on rotation

### Rotation Cycle

```
Tap → Rotation 0 (H: [0,1])
Tap → Rotation 1 (V: [0/1])
Tap → Rotation 2 (H: [1,0])
Tap → Rotation 3 (V: [1/0])
Tap → Rotation 0 (cycles back)
```

## Testing

- ✅ Single tap advances through all 4 rotations
- ✅ Blocks appear in correct positions for each rotation
- ✅ Wall kick works when rotating near edges
- ✅ Ghost piece follows rotation
- ✅ Hard drop maintains rotation
- ✅ Hold swap resets rotation to 0

## Benefits

1. **Full control**: Players can now access all 4 orientations
2. **Strategic depth**: More placement options for puzzle solving
3. **Consistent behavior**: Predictable rotation pattern
4. **Standard feel**: Matches expectations from similar puzzle games
