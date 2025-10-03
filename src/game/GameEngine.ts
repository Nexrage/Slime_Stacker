import { BlockCell, BlockType } from '@/game/BlockTypes';
import { GRID_COLS, GRID_ROWS } from '@/utils/constants';
import { createRng } from '@/utils/rng';

export type FallingPair = {
  cells: [BlockType, BlockType];
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical';
};

export type EngineState = {
  grid: BlockCell[][];
  falling: FallingPair | null;
  next: [BlockType, BlockType];
  hold: [BlockType, BlockType] | null;
  canHold: boolean;
  seed: number;
  rng: () => number;
};

export type TickResult = {
  grid: BlockCell[][];
  falling: FallingPair | null;
  next: [BlockType, BlockType];
  hold: [BlockType, BlockType] | null;
  canHold: boolean;
  scoredStars?: number;
  chains?: number;
  events?: GameEvent[];
  gameOver?: boolean;
};

export type GameEvent =
  | { type: 'lock'; positions: { x: number; y: number }[] }
  | { type: 'clear'; positions: { x: number; y: number }[]; chain: number }
  | { type: 'bomb'; rows: number[]; chain: number };

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
  };
}

export function spawnPairFromCells(cells: [BlockType, BlockType]): FallingPair {
  return { cells, x: Math.floor(GRID_COLS / 2) - 1, y: 0, orientation: 'horizontal' };
}

export function pairPositions(pair: FallingPair) {
  return pair.orientation === 'horizontal'
    ? [ { x: pair.x, y: pair.y }, { x: pair.x + 1, y: pair.y } ]
    : [ { x: pair.x, y: pair.y }, { x: pair.x, y: pair.y + 1 } ];
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
  if (canMove(grid, pair, dx, dy)) return { ...pair, x: pair.x + dx, y: pair.y + dy };
  return pair;
}

export function rotatePair(grid: BlockCell[][], pair: FallingPair): FallingPair {
  const next = pair.orientation === 'horizontal' ? 'vertical' : 'horizontal';
  let candidate: FallingPair = { ...pair, orientation: next };
  if (next === 'horizontal' && candidate.x >= GRID_COLS - 1) candidate.x = GRID_COLS - 2;
  if (next === 'vertical' && candidate.y >= GRID_ROWS - 1) candidate.y = GRID_ROWS - 2;
  return canPlace(grid, pairPositions(candidate)) ? candidate : pair;
}

export function getGhostPositions(grid: BlockCell[][], pair: FallingPair | null): { x: number; y: number }[] {
  if (!pair) return [];
  let ghost = { ...pair };
  while (canMove(grid, ghost, 0, 1)) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }
  return pairPositions(ghost);
}

export function lockPair(grid: BlockCell[][], pair: FallingPair): BlockCell[][] {
  const g = grid.map(r => r.slice());
  const positions = pairPositions(pair);
  g[positions[0].y][positions[0].x] = { type: pair.cells[0] };
  g[positions[1].y][positions[1].x] = { type: pair.cells[1] };
  return g;
}

export function applyGravity(grid: BlockCell[][]): BlockCell[][] {
  const g = grid.map(r => r.slice());
  for (let x = 0; x < GRID_COLS; x++) {
    for (let y = GRID_ROWS - 2; y >= 0; y--) {
      if (g[y][x] && !g[y + 1][x]) {
        let ny = y;
        while (ny + 1 < GRID_ROWS && !g[ny + 1][x]) ny++;
        g[ny][x] = g[y][x];
        g[y][x] = null;
      }
    }
  }
  return g;
}

export function overlayPair(grid: BlockCell[][], pair: FallingPair | null): BlockCell[][] {
  if (!pair) return grid;
  const g = grid.map(r => r.slice());
  const positions = pairPositions(pair);
  positions.forEach((p, i) => { if (inBounds(p.x, p.y)) g[p.y][p.x] = { type: pair.cells[i] }; });
  return g;
}

function isFriend(cell: BlockCell): cell is { type: BlockType.RICK | BlockType.COO | BlockType.KINE } {
  return !!cell && (cell.type === BlockType.RICK || cell.type === BlockType.COO || cell.type === BlockType.KINE);
}

function detectMatches(grid: BlockCell[][]): {
  clearSet: Set<string>;
  bombRows: Set<number>;
  bricksToStar: Set<string>;
} {
  const clearSet = new Set<string>();
  const bombRows = new Set<number>();
  const bricksToStar = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;

  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const cell = grid[y][x];
      if (!cell) continue;
      if (cell.type !== BlockType.STAR && cell.type !== BlockType.BOMB && cell.type !== BlockType.BRICK) continue;

      if (x - 1 >= 0 && x + 1 < GRID_COLS) {
        const left = grid[y][x - 1];
        const right = grid[y][x + 1];
        if (isFriend(left) && isFriend(right) && left.type === right.type) {
          if (cell.type === BlockType.BOMB) {
            bombRows.add(y);
          } else if (cell.type === BlockType.BRICK) {
            bricksToStar.add(key(x, y));
            clearSet.add(key(x - 1, y));
            clearSet.add(key(x + 1, y));
          } else {
            clearSet.add(key(x - 1, y));
            clearSet.add(key(x, y));
            clearSet.add(key(x + 1, y));
          }
        }
      }
      if (y - 1 >= 0 && y + 1 < GRID_ROWS) {
        const up = grid[y - 1][x];
        const down = grid[y + 1][x];
        if (isFriend(up) && isFriend(down) && up.type === down.type) {
          if (cell.type === BlockType.BOMB) {
            bombRows.add(y);
          } else if (cell.type === BlockType.BRICK) {
            bricksToStar.add(key(x, y));
            clearSet.add(key(x, y - 1));
            clearSet.add(key(x, y + 1));
          } else {
            clearSet.add(key(x, y - 1));
            clearSet.add(key(x, y));
            clearSet.add(key(x, y + 1));
          }
        }
      }
    }
  }

  bombRows.forEach((row) => {
    for (let cx = 0; cx < GRID_COLS; cx++) clearSet.add(key(cx, row));
  });

  return { clearSet, bombRows, bricksToStar };
}

function resolveMatchesAndGravity(grid: BlockCell[][]): { grid: BlockCell[][]; totalStars: number; chains: number; events: GameEvent[] } {
  let g = grid;
  let totalStars = 0;
  let chains = 0;
  const events: GameEvent[] = [];
  const fromKey = (s: string) => s.split(',').map(Number) as [number, number];

  while (true) {
    const { clearSet, bricksToStar, bombRows } = detectMatches(g);
    if (clearSet.size === 0 && bricksToStar.size === 0) break;

    if (bricksToStar.size > 0) {
      const g2 = g.map(r => r.slice());
      bricksToStar.forEach((s) => {
        const [x, y] = fromKey(s);
        if (inBounds(x, y)) g2[y][x] = { type: BlockType.STAR };
      });
      g = g2;
    }

    if (clearSet.size > 0) {
      totalStars += clearSet.size;
      const g3 = g.map(r => r.slice());
      const positions: { x: number; y: number }[] = [];
      clearSet.forEach((s) => {
        const [x, y] = fromKey(s);
        if (inBounds(x, y)) g3[y][x] = null;
        positions.push({ x, y });
      });
      g = g3;
      events.push({ type: 'clear', positions, chain: chains + 1 });
    }

    if (bombRows.size > 0) {
      events.push({ type: 'bomb', rows: Array.from(bombRows), chain: chains + 1 });
    }

    chains += 1;
    g = applyGravity(g);
  }
  return { grid: g, totalStars, chains, events };
}

export function tick(state: EngineState): TickResult {
  let { grid, falling, next, hold, canHold, rng } = state;
  if (!falling) {
    const newFalling = spawnPairFromCells(next);
    // If spawn position is blocked, it's game over
    const spawnPositions = pairPositions(newFalling);
    if (!canPlace(grid, spawnPositions)) {
      return { grid, falling: null, next, hold, canHold, scoredStars: 0, chains: 0, events: [], gameOver: true };
    }
    return { grid, falling: newFalling, next: generatePairCells(rng), hold, canHold: true, scoredStars: 0, chains: 0, events: [] };
  }
  if (canMove(grid, falling, 0, 1)) {
    return { grid, falling: { ...falling, y: falling.y + 1 }, next, hold, canHold, scoredStars: 0, chains: 0, events: [] };
  }
  const g2 = lockPair(grid, falling);
  const lockPositions = pairPositions(falling);
  const g3 = applyGravity(g2);
  const { grid: g4, totalStars, chains, events } = resolveMatchesAndGravity(g3);
  return {
    grid: g4,
    falling: null,
    next,
    hold,
    canHold: true,
    scoredStars: totalStars,
    chains,
    events: [{ type: 'lock', positions: lockPositions }, ...events],
  };
}

export function holdSwap(state: EngineState): EngineState {
  const { falling, hold, next } = state;
  if (!falling || !state.canHold) return state;
  if (hold) {
    // swap
    const newFalling = spawnPairFromCells(hold);
    return { ...state, falling: newFalling, hold: falling.cells, canHold: false };
  } else {
    // move falling to hold and bring next
    const newFalling = spawnPairFromCells(next);
    return { ...state, falling: newFalling, next: generatePairCells(state.rng), hold: falling.cells, canHold: false };
  }
}
