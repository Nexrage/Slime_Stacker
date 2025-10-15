import { BlockCell, BlockType } from '@/game/BlockTypes';
import { GRID_COLS, GRID_ROWS } from '@/utils/constants';
import { createRng } from '@/utils/rng';

export type FallingPair = {
  cells: [BlockType, BlockType];
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical';
  rotation: 0 | 1 | 2 | 3; // 0: cells[0,1] horizontal, 1: cells[0,1] vertical, 2: cells[1,0] horizontal, 3: cells[1,0] vertical
};

export type GamePhase = 
  | { type: 'falling' } // Pair is falling
  | { type: 'gravity' } // Blocks are settling after lock/clear
  | { type: 'matching'; chainNumber: number } // Detecting matches
  | { type: 'clearing'; chainNumber: number }; // Animating clears (waiting for animation)

export type ChainState = {
  totalStars: number;
  chainCount: number;
  clearedGrid: BlockCell[][] | null; // Grid after clearing, waiting to apply
};

export type EngineState = {
  grid: BlockCell[][];
  falling: FallingPair | null;
  next: [BlockType, BlockType];
  hold: [BlockType, BlockType] | null;
  canHold: boolean;
  seed: number;
  rng: () => number;
  phase: GamePhase;
  chainState: ChainState;
};

export type TickResult = {
  grid: BlockCell[][];
  falling: FallingPair | null;
  next: [BlockType, BlockType];
  hold: [BlockType, BlockType] | null;
  canHold: boolean;
  phase: GamePhase;
  scoredStars?: number;
  chains?: number;
  events?: GameEvent[];
  gameOver?: boolean;
};

export type GameEvent =
  | { type: 'lock'; positions: { x: number; y: number }[] }
  | { type: 'clear'; positions: { x: number; y: number }[]; cells?: { x: number; y: number; type: BlockType; cracked?: boolean }[]; chain: number }
  | { type: 'bomb'; rows: number[]; cells?: { x: number; y: number; type: BlockType; cracked?: boolean }[]; chain: number }
  | { type: 'gravity'; falls: { x: number; fromY: number; toY: number }[]; chain: number }
  | { type: 'hardDropTrail'; positions: { x: number; y: number }[] }
  | { type: 'boardShake' };

export function createEmptyGrid(): BlockCell[][] {
  return Array.from({ length: GRID_ROWS }, () => Array.from({ length: GRID_COLS }, () => null));
}

function randFriend(rng: () => number): BlockType {
  return [BlockType.RICK, BlockType.COO, BlockType.KINE][Math.floor(rng() * 3)];
}

function randSpecial(rng: () => number): BlockType | null {
  const r = rng();
  if (r < 0.03) return BlockType.BOMB;
  if (r < 0.06) return BlockType.BRICK;
  if (r < 0.16) return BlockType.STAR;
  return null;
}

function generatePairCells(rng: () => number): [BlockType, BlockType] {
  const a = randSpecial(rng) ?? randFriend(rng);
  const b = randSpecial(rng) ?? randFriend(rng);
  return [a, b];
}

export function initialEngineState(seed: number = Math.floor(Math.random() * 0x7fffffff)): EngineState {
  const rng = createRng(seed);
  return {
    grid: createEmptyGrid(),
    falling: null,
    next: generatePairCells(rng),
    hold: null,
    canHold: true,
    seed,
    rng,
    phase: { type: 'falling' },
    chainState: { totalStars: 0, chainCount: 0, clearedGrid: null },
  };
}

export function spawnPairFromCells(cells: [BlockType, BlockType]): FallingPair {
  // Spawn at columns 3 and 4 (0-indexed: columns 2 and 3)
  // Pivot is the FIRST block (left block when horizontal). Set pivot x=2 so partner (second) is at x=3.
  return { cells, x: 2, y: 0, orientation: 'horizontal', rotation: 0 };
}

export function pairPositions(pair: FallingPair): { x: number; y: number; blockIndex: number }[] {
  // Define the pivot as the FIRST block (blockIndex 0) fixed at (pair.x, pair.y)
  // The second block (blockIndex 1) rotates around the pivot in order: right -> down -> left -> up
  switch (pair.rotation) {
    case 0: // partner to the RIGHT of pivot (horizontal [0][1])
      return [
        { x: pair.x, y: pair.y, blockIndex: 0 },
        { x: pair.x + 1, y: pair.y, blockIndex: 1 }
      ];
    case 1: // partner BELOW pivot (vertical [0]\n[1])
      return [
        { x: pair.x, y: pair.y, blockIndex: 0 },
        { x: pair.x, y: pair.y + 1, blockIndex: 1 }
      ];
    case 2: // partner to the LEFT of pivot (horizontal [1][0])
      return [
        { x: pair.x, y: pair.y, blockIndex: 0 },
        { x: pair.x - 1, y: pair.y, blockIndex: 1 }
      ];
    case 3: // partner ABOVE pivot (vertical [1]\n[0])
      return [
        { x: pair.x, y: pair.y, blockIndex: 0 },
        { x: pair.x, y: pair.y - 1, blockIndex: 1 }
      ];
  }
}

export function inBounds(x: number, y: number) { return x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS; }

export function canPlace(grid: BlockCell[][], pos: {x:number;y:number}[]) {
  return pos.every(p => inBounds(p.x, p.y) && grid[p.y][p.x] === null);
}

export function canMove(grid: BlockCell[][], pair: FallingPair, dx: number, dy: number) {
  const positions = pairPositions(pair).map(p => ({ x: p.x + dx, y: p.y + dy }));
  return canPlace(grid, positions);
}

export function movePair(grid: BlockCell[][], pair: FallingPair, dx: number, dy: number): FallingPair {
  if (canMove(grid, pair, dx, dy)) {
    const direction = dx < 0 ? '⬅️' : dx > 0 ? '➡️' : dy > 0 ? '⬇️' : '⬆️';
    console.log(`${direction} [MOVE]`, { from: { x: pair.x, y: pair.y }, to: { x: pair.x + dx, y: pair.y + dy } });
    return { ...pair, x: pair.x + dx, y: pair.y + dy };
  }
  return pair;
}

export function rotatePair(grid: BlockCell[][], pair: FallingPair): FallingPair {
  // Cycle through all 4 rotations around the pivot (FIRST block stays fixed)
  const nextRotation = ((pair.rotation + 1) % 4) as 0 | 1 | 2 | 3;
  const nextOrientation = (nextRotation === 0 || nextRotation === 2) ? 'horizontal' : 'vertical';

  const candidate: FallingPair = {
    ...pair,
    orientation: nextOrientation,
    rotation: nextRotation,
  };

  // Check if the rotation is valid (no wall kick; pivot remains fixed)
  const positions = pairPositions(candidate);
  if (canPlace(grid, positions)) {
    console.log('🔄 [ROTATE]', { from: pair.rotation, to: nextRotation, orientation: nextOrientation, pivotFirst: { x: pair.x, y: pair.y } });
    return candidate;
  }
  return pair;
}

export function getGhostPositions(grid: BlockCell[][], pair: FallingPair | null): { x: number; y: number }[] {
  if (!pair) return [];
  let ghost = { ...pair };
  while (canMove(grid, ghost, 0, 1)) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }
  // Return positions without blockIndex for ghost display
  return pairPositions(ghost).map(p => ({ x: p.x, y: p.y }));
}

export function lockPair(grid: BlockCell[][], pair: FallingPair): BlockCell[][] {
  const g = grid.map(r => r.slice());
  const positions = pairPositions(pair);
  // Use blockIndex to get the correct cell from pair.cells
  g[positions[0].y][positions[0].x] = { type: pair.cells[positions[0].blockIndex] };
  g[positions[1].y][positions[1].x] = { type: pair.cells[positions[1].blockIndex] };
  return g;
}

// Tick-based gravity: move blocks down by 1 row, return true if any block moved
export function applyGravityStep(grid: BlockCell[][]): { grid: BlockCell[][]; didMove: boolean; falls: { x: number; fromY: number; toY: number }[] } {
  const g = grid.map(r => r.slice());
  let didMove = false;
  const falls: { x: number; fromY: number; toY: number }[] = [];
  
  // Scan bottom-to-top to avoid moving the same block twice
  for (let x = 0; x < GRID_COLS; x++) {
    for (let y = GRID_ROWS - 2; y >= 0; y--) {
      if (g[y][x] && !g[y + 1][x]) {
        // Move block down by 1
        g[y + 1][x] = g[y][x];
        g[y][x] = null;
        falls.push({ x, fromY: y, toY: y + 1 });
        didMove = true;
      }
    }
  }
  
  return { grid: g, didMove, falls };
}

export function overlayPair(grid: BlockCell[][], pair: FallingPair | null): BlockCell[][] {
  if (!pair) return grid;
  const g = grid.map(r => r.slice());
  const positions = pairPositions(pair);
  positions.forEach((p) => { 
    if (inBounds(p.x, p.y)) g[p.y][p.x] = { type: pair.cells[p.blockIndex] }; 
  });
  return g;
}

function isFriend(cell: BlockCell): cell is { type: BlockType.RICK | BlockType.COO | BlockType.KINE } {
  return !!cell && (cell.type === BlockType.RICK || cell.type === BlockType.COO || cell.type === BlockType.KINE);
}

function detectMatches(grid: BlockCell[][]): {
  clearSet: Set<string>;
  bombRows: Set<number>;
  bricksToCrack: Set<string>;
  bricksToEliminate: Set<string>;
} {
  const clearSet = new Set<string>();
  const bombRows = new Set<number>();
  const bricksToCrack = new Set<string>();
  const bricksToEliminate = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;

  // First, check for adjacent Friend Blocks (2+ identical touching)
  const visited = new Set<string>();
  const floodFill = (x: number, y: number, friendType: BlockType): Set<string> => {
    const cluster = new Set<string>();
    const stack = [{ x, y }];
    
    while (stack.length > 0) {
      const pos = stack.pop()!;
      const k = key(pos.x, pos.y);
      
      if (visited.has(k)) continue;
      if (!inBounds(pos.x, pos.y)) continue;
      
      const cell = grid[pos.y][pos.x];
      if (!cell || cell.type !== friendType) continue;
      
      visited.add(k);
      cluster.add(k);
      
      // Check all 4 directions
      stack.push({ x: pos.x + 1, y: pos.y });
      stack.push({ x: pos.x - 1, y: pos.y });
      stack.push({ x: pos.x, y: pos.y + 1 });
      stack.push({ x: pos.x, y: pos.y - 1 });
    }
    
    return cluster;
  };

  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const cell = grid[y][x];
      if (!cell || !isFriend(cell)) continue;
      
      const k = key(x, y);
      if (visited.has(k)) continue;
      
      const cluster = floodFill(x, y, cell.type);
      if (cluster.size >= 2) {
        cluster.forEach(k => clearSet.add(k));
      }
    }
  }

  // Then, check for sandwich patterns (any amount of Stars/Bombs/Bricks between matching Friends)
  // Check horizontal sandwiches
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS - 1; x++) {
      const leftCell = grid[y][x];
      if (!isFriend(leftCell)) continue;
      
      // Find all consecutive special blocks (Star/Bomb/Brick)
      let specialBlocks: { x: number; type: BlockType; cracked?: boolean }[] = [];
      let scanX = x + 1;
      
      while (scanX < GRID_COLS) {
        const scanCell = grid[y][scanX];
        if (!scanCell) break;
        if (scanCell.type === BlockType.STAR || scanCell.type === BlockType.BOMB || scanCell.type === BlockType.BRICK) {
          specialBlocks.push({ x: scanX, type: scanCell.type, cracked: scanCell.cracked });
          scanX++;
        } else {
          break;
        }
      }
      
      // Check if there's a matching Friend block on the right side
      if (specialBlocks.length > 0 && scanX < GRID_COLS) {
        const rightCell = grid[y][scanX];
        if (isFriend(rightCell) && leftCell.type === rightCell.type) {
          // Valid sandwich! Clear the friends and process special blocks
          clearSet.add(key(x, y)); // left friend
          clearSet.add(key(scanX, y)); // right friend
          
          specialBlocks.forEach(sb => {
            if (sb.type === BlockType.BOMB) {
              bombRows.add(y);
            } else if (sb.type === BlockType.BRICK) {
              if (sb.cracked) {
                bricksToEliminate.add(key(sb.x, y));
              } else {
                bricksToCrack.add(key(sb.x, y));
              }
            } else if (sb.type === BlockType.STAR) {
              clearSet.add(key(sb.x, y));
            }
          });
        }
      }
    }
  }
  
  // Check vertical sandwiches
  for (let x = 0; x < GRID_COLS; x++) {
    for (let y = 0; y < GRID_ROWS - 1; y++) {
      const topCell = grid[y][x];
      if (!isFriend(topCell)) continue;
      
      // Find all consecutive special blocks (Star/Bomb/Brick)
      let specialBlocks: { y: number; type: BlockType; cracked?: boolean }[] = [];
      let scanY = y + 1;
      
      while (scanY < GRID_ROWS) {
        const scanCell = grid[scanY][x];
        if (!scanCell) break;
        if (scanCell.type === BlockType.STAR || scanCell.type === BlockType.BOMB || scanCell.type === BlockType.BRICK) {
          specialBlocks.push({ y: scanY, type: scanCell.type, cracked: scanCell.cracked });
          scanY++;
        } else {
          break;
        }
      }
      
      // Check if there's a matching Friend block on the bottom
      if (specialBlocks.length > 0 && scanY < GRID_ROWS) {
        const bottomCell = grid[scanY][x];
        if (isFriend(bottomCell) && topCell.type === bottomCell.type) {
          // Valid sandwich! Clear the friends and process special blocks
          clearSet.add(key(x, y)); // top friend
          clearSet.add(key(x, scanY)); // bottom friend
          
          specialBlocks.forEach(sb => {
            if (sb.type === BlockType.BOMB) {
              bombRows.add(sb.y);
            } else if (sb.type === BlockType.BRICK) {
              if (sb.cracked) {
                bricksToEliminate.add(key(x, sb.y));
              } else {
                bricksToCrack.add(key(x, sb.y));
              }
            } else if (sb.type === BlockType.STAR) {
              clearSet.add(key(x, sb.y));
            }
          });
        }
      }
    }
  }

  // Bomb clears entire row
  bombRows.forEach((row) => {
    for (let cx = 0; cx < GRID_COLS; cx++) clearSet.add(key(cx, row));
  });

  return { clearSet, bombRows, bricksToCrack, bricksToEliminate };
}

function getLeastFilledColumns(grid: BlockCell[][], count: number): number[] {
  // Count blocks in each column
  const columnHeights = Array.from({ length: GRID_COLS }, (_, x) => {
    let height = 0;
    for (let y = GRID_ROWS - 1; y >= 0; y--) {
      if (grid[y][x]) height++;
      else break; // Stop at first empty cell from bottom
    }
    return { x, height };
  });
  
  // Sort by height (least filled first), then by column index for stability
  columnHeights.sort((a, b) => a.height - b.height || a.x - b.x);
  
  // Return the column indices
  return columnHeights.slice(0, count).map(c => c.x);
}

function dropBonusStars(grid: BlockCell[][], count: number): BlockCell[][] {
  if (count <= 0) return grid;
  
  const g = grid.map(r => r.slice());
  const columns = getLeastFilledColumns(g, 2); // Always drop into 2 least-filled columns
  
  // Distribute stars across the two columns
  let starsPerColumn = Math.floor(count / 2);
  let remainder = count % 2;
  
  columns.forEach((x, idx) => {
    let starsToDrop = starsPerColumn + (idx === 0 ? remainder : 0);
    
    // Find the lowest empty position in this column
    for (let i = 0; i < starsToDrop; i++) {
      for (let y = GRID_ROWS - 1; y >= 0; y--) {
        if (!g[y][x]) {
          g[y][x] = { type: BlockType.STAR };
          break;
        }
      }
    }
  });
  
  return g;
}

// Process one step of matching (no gravity, no looping)
// Returns the grid after clearing/cracking, stars earned, and events generated
function processMatches(grid: BlockCell[][], chainNumber: number): { 
  grid: BlockCell[][]; 
  starsEarned: number; 
  hadMatches: boolean;
  events: GameEvent[];
} {
  const { clearSet, bricksToCrack, bricksToEliminate, bombRows } = detectMatches(grid);
  const hadMatches = clearSet.size > 0 || bricksToCrack.size > 0 || bricksToEliminate.size > 0;
  
  if (!hadMatches) {
    return { grid, starsEarned: 0, hadMatches: false, events: [] };
  }
  
  console.log(`✨ [MATCH] Chain ${chainNumber}`, {
    cleared: clearSet.size,
    bricksCracked: bricksToCrack.size,
    bricksEliminated: bricksToEliminate.size,
    bombRows: Array.from(bombRows),
  });
  
  let g = grid;
  const events: GameEvent[] = [];
  const fromKey = (s: string) => s.split(',').map(Number) as [number, number];
  
  // Crack hard blocks (first sandwich)
  if (bricksToCrack.size > 0) {
    const g2 = g.map(r => r.slice());
    bricksToCrack.forEach((s) => {
      const [x, y] = fromKey(s);
      if (inBounds(x, y) && g2[y][x]) {
        g2[y][x] = { type: BlockType.BRICK, cracked: true };
      }
    });
    g = g2;
  }
  
  let starsEarned = 0;
  
  // Clear blocks and eliminate cracked bricks
  if (clearSet.size > 0 || bricksToEliminate.size > 0) {
    const flashCells: { x: number; y: number; type: BlockType; cracked?: boolean }[] = [];
    clearSet.forEach((s) => {
      const [fx, fy] = fromKey(s);
      const c = g[fy]?.[fx];
      if (c) flashCells.push({ x: fx, y: fy, type: c.type, cracked: (c as any).cracked });
    });
    bricksToEliminate.forEach((s) => {
      const [fx, fy] = fromKey(s);
      const c = g[fy]?.[fx];
      if (c) flashCells.push({ x: fx, y: fy, type: c.type, cracked: (c as any).cracked });
    });
    
    // Count stars
    clearSet.forEach((s) => {
      const [x, y] = fromKey(s);
      if (inBounds(x, y)) {
        const cell = g[y][x];
        if (cell?.type === BlockType.STAR) starsEarned++;
      }
    });
    bricksToEliminate.forEach(() => starsEarned++); // Hard blocks = 1 star each
    
    const g3 = g.map(r => r.slice());
    const positions: { x: number; y: number }[] = [];
    clearSet.forEach((s) => {
      const [x, y] = fromKey(s);
      if (inBounds(x, y)) {
        g3[y][x] = null;
        positions.push({ x, y });
      }
    });
    bricksToEliminate.forEach((s) => {
      const [x, y] = fromKey(s);
      if (inBounds(x, y)) {
        g3[y][x] = null;
        positions.push({ x, y });
      }
    });
    
    g = g3;
    events.push({ type: 'clear', positions, cells: flashCells, chain: chainNumber });
  }
  
  // Bomb clears
  if (bombRows.size > 0) {
    const bombCells: { x: number; y: number; type: BlockType; cracked?: boolean }[] = [];
    bombRows.forEach((row) => {
      for (let cx = 0; cx < GRID_COLS; cx++) {
        const c = g[row]?.[cx];
        if (c) bombCells.push({ x: cx, y: row, type: c.type, cracked: (c as any).cracked });
      }
    });
    events.push({ type: 'bomb', rows: Array.from(bombRows), cells: bombCells, chain: chainNumber });
  }
  
  return { grid: g, starsEarned, hadMatches: true, events };
}

function raiseHandRow(grid: BlockCell[][], rng: () => number): BlockCell[][] {
  const newGrid = grid.map(r => r.slice());
  
  // Generate a bottom row with random blocks (no empties)
  const bottomRow: BlockCell[] = Array.from({ length: GRID_COLS }, () => {
    const r = rng();
    // No empties: renormalize original 15%/30%/5% (non-empty 50%) → 30%/60%/10%
    if (r < 0.3) return { type: BlockType.STAR };
    if (r < 0.9) return { type: randFriend(rng) };
    return { type: BlockType.BRICK };
  });
  // Add a complete Brick row above the RNG row
  const brickRow: BlockCell[] = Array.from({ length: GRID_COLS }, () => ({ type: BlockType.BRICK }));
  
  // Shift all rows up by two (remove top two rows), then add Brick row above RNG row (RNG is the bottom-most of the two)
  newGrid.shift();
  newGrid.shift();
  newGrid.push(brickRow);
  newGrid.push(bottomRow);
  
  return newGrid;
}

export function tick(state: EngineState): TickResult {
  let { grid, falling, next, hold, canHold, rng, phase, chainState } = state;
  
  // ===== FALLING PHASE: Pair is falling =====
  if (phase.type === 'falling') {
    // Spawn new pair if none exists
    if (!falling) {
      const newFalling = spawnPairFromCells(next);
      console.log('🎮 [SPAWN]', {
        cells: newFalling.cells,
        position: { x: newFalling.x, y: newFalling.y },
        orientation: newFalling.orientation,
        rotation: newFalling.rotation,
      });
      
      // Game over if spawn blocked
      const spawnPositions = pairPositions(newFalling);
      if (!canPlace(grid, spawnPositions)) {
        console.log('💀 [GAME OVER] - Spawn columns blocked');
        return { 
          grid, 
          falling: null, 
          next, 
          hold, 
          canHold, 
          phase: { type: 'falling' },
          scoredStars: 0, 
          chains: 0, 
          events: [], 
          gameOver: true 
        };
      }
      return { 
        grid, 
        falling: newFalling, 
        next: generatePairCells(rng), 
        hold, 
        canHold: true,
        phase: { type: 'falling' },
        scoredStars: 0, 
        chains: 0, 
        events: [] 
      };
    }
    
    // Try to move pair down
    if (canMove(grid, falling, 0, 1)) {
      console.log('⬇️  [FALL] y:', falling.y, '→', falling.y + 1);
      return { 
        grid, 
        falling: { ...falling, y: falling.y + 1 }, 
        next, 
        hold, 
        canHold,
        phase: { type: 'falling' },
        scoredStars: 0, 
        chains: 0, 
        events: [] 
      };
    }
    
    // Can't move down - lock and enter gravity phase
    console.log('🔒 [LOCK]', {
      position: { x: falling.x, y: falling.y },
      cells: falling.cells,
      rotation: falling.rotation,
    });
    
    const lockedGrid = lockPair(grid, falling);
    
    return {
      grid: lockedGrid,
      falling: null,
      next,
      hold,
      canHold: true,
      phase: { type: 'gravity' },
      scoredStars: 0,
      chains: 0,
      events: []
    };
  }
  
  // ===== GRAVITY PHASE: Blocks falling =====
  if (phase.type === 'gravity') {
    const { grid: newGrid, didMove, falls } = applyGravityStep(grid);
    
    if (didMove) {
      // Blocks moved, continue gravity phase
      console.log('⬇️  [GRAVITY] blocks falling');
      // Gravity happens in real-time, no need to store events for animation
      return {
        grid: newGrid,
        falling: null,
        next,
        hold,
        canHold,
        phase: { type: 'gravity' },
        scoredStars: 0,
        chains: 0,
        events: []
      };
    }
    
    // No blocks moved - gravity settled, enter matching phase
    console.log('⬇️  [GRAVITY] settled');
    return {
      grid: newGrid,
      falling: null,
      next,
      hold,
      canHold,
      phase: { type: 'matching', chainNumber: chainState.chainCount + 1 },
      scoredStars: 0,
      chains: 0,
      events: []
    };
  }
  
  // ===== MATCHING PHASE: Detect matches and trigger animations =====
  if (phase.type === 'matching') {
    const { grid: clearedGrid, starsEarned, hadMatches, events } = processMatches(grid, phase.chainNumber);
    
    if (hadMatches) {
      // Matches found - enter clearing phase to animate
      chainState.totalStars += starsEarned;
      chainState.chainCount = phase.chainNumber;
      chainState.clearedGrid = clearedGrid; // Store cleared grid
      
      console.log('🔗 [CHAIN]', {
        chain: chainState.chainCount,
        starsThisChain: starsEarned,
        totalStars: chainState.totalStars,
      });
      
      // Enter clearing phase - wait for animations
      return {
        grid, // Keep OLD grid visible during animation
        falling: null,
        next,
        hold,
        canHold,
        phase: { type: 'clearing', chainNumber: phase.chainNumber },
        scoredStars: 0,
        chains: 0,
        events // Return clear/bomb events for animation
      };
    }
    
    // No matches - chains complete
    console.log('✅ [RESOLUTION COMPLETE]', {
      totalChains: chainState.chainCount,
      totalStars: chainState.totalStars,
    });
    
    let finalGrid = grid;
    
    // Hand row only if no chains occurred
    if (chainState.chainCount === 0) {
      const handChance = rng();
      if (handChance < 0.1) {
        console.log('✊ [HAND ROW] - Adding random row from bottom');
        finalGrid = raiseHandRow(grid, rng);
      }
    }
    
    // Return to falling phase with results
    return {
      grid: finalGrid,
      falling: null,
      next,
      hold,
      canHold,
      phase: { type: 'falling' },
      scoredStars: chainState.totalStars,
      chains: chainState.chainCount,
      events: []
    };
  }
  
  // ===== CLEARING PHASE: Wait for animation to complete, then apply cleared grid =====
  if (phase.type === 'clearing') {
    // Animation should be playing - this tick just applies the cleared grid and moves to gravity
    console.log('✨ [CLEAR COMPLETE] Applying cleared grid');
    
    let finalGrid = chainState.clearedGrid || grid;
    chainState.clearedGrid = null;
    
    // Drop bonus stars if chain >= 2
    if (chainState.chainCount >= 2) {
      let bonusStars = 0;
      switch (chainState.chainCount) {
        case 2: bonusStars = 2; break;
        case 3: bonusStars = 4; break;
        case 4: bonusStars = 5; break;
        case 5: bonusStars = 6; break;
        default: bonusStars = 12; break;
      }
      console.log(`⭐ [BONUS STARS] Chain ${chainState.chainCount} → ${bonusStars} stars dropped`);
      finalGrid = dropBonusStars(finalGrid, bonusStars);
    }
    
    // Back to gravity phase to settle blocks
    return {
      grid: finalGrid,
      falling: null,
      next,
      hold,
      canHold,
      phase: { type: 'gravity' },
      scoredStars: 0,
      chains: 0,
      events: []
    };
  }
  
  // Should never reach here
  console.error('❌ [ERROR] Unknown phase:', phase);
  return {
    grid,
    falling,
    next,
    hold,
    canHold,
    phase,
    scoredStars: 0,
    chains: 0,
    events: []
  };
}

export function holdSwap(state: EngineState): EngineState {
  const { falling, hold, next } = state;
  if (!falling || !state.canHold) return state;
  
  if (hold) {
    // swap
    console.log('🔁 [HOLD SWAP]', { held: hold, falling: falling.cells });
    const newFalling = spawnPairFromCells(hold);
    return { ...state, falling: newFalling, hold: falling.cells, canHold: false };
  } else {
    // move falling to hold and bring next
    console.log('💾 [HOLD STORE]', { stored: falling.cells, bringing: next });
    const newFalling = spawnPairFromCells(next);
    return { ...state, falling: newFalling, next: generatePairCells(state.rng), hold: falling.cells, canHold: false };
  }
}
