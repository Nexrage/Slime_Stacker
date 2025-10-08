import { useEffect, useRef, useState, useCallback } from 'react';
import { initialEngineState, tick, EngineState, overlayPair, movePair, rotatePair, getGhostPositions, holdSwap, pairPositions, GameEvent, canMove } from '@/game/GameEngine';
import { audio } from '@/utils/audio';
import { BlockType } from '@/game/BlockTypes';
import * as Haptics from 'expo-haptics';

// removed unused stub

export function useGameLoop(active: boolean = true, mode?: string, opts?: { hapticsEnabled?: boolean; sameSeed?: boolean }) {
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 0x7fffffff));
  const [grid, setGrid] = useState(initialEngineState(seed).grid);
  const [score, setScore] = useState(0);
  const [chains, setChains] = useState(0);
  const [ghost, setGhost] = useState<{ x: number; y: number }[]>([]);
  const [next, setNext] = useState<[string, string] | null>(null);
  const [hold, setHold] = useState<[string, string] | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [timeLeft, setTimeLeft] = useState(mode === 'timeAttack' ? 180 : undefined);
  const [gameOver, setGameOver] = useState(false);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [fallingPositions, setFallingPositions] = useState<{ x: number; y: number }[]>([]);
  const [dropTrail, setDropTrail] = useState<{ x: number; y: number }[]>([]);
  const dropTrailTimer = useRef<any>(null);
  const [shake, setShake] = useState(false);
  const [isResolving, setIsResolving] = useState(false); // Interim phase lock

  const timer = useRef<any>(null);
  const handTimer = useRef<any>(null);
  const handIntervalMs = useRef<number>(10000);
  const stateRef = useRef<EngineState>(initialEngineState(seed));

  // Group events by chain index (> 0). Chain 0 events (e.g., lock) are not animated as a chain step
  function groupEventsByChain(ev: GameEvent[]) {
    const map = new Map<number, GameEvent[]>();
    ev.forEach(e => {
      const chain = (e as any).chain ?? 0;
      const arr = map.get(chain) ?? [];
      arr.push(e);
      map.set(chain, arr);
    });
    const grouped = Array.from(map.entries())
      .filter(([c]) => c > 0)
      .sort((a, b) => a[0] - b[0])
      .map(([, arr]) => arr);
    if (grouped.length > 0) {
      console.log('🎞️ [INTERIM] groupEventsByChain', grouped.map(g => g.map(e => e.type)));
    }
    return grouped;
  }

  // Play interim phase animations one chain at a time and lock input
  async function playInterim(ev: GameEvent[]) {
    console.log('🎞️ [INTERIM] start', ev.map(e => ({ type: e.type, chain: (e as any).chain })));
    const chains = groupEventsByChain(ev);
    if (chains.length === 0) return;
    setIsResolving(true);
    console.log('🔒 [INTERIM] isResolving=true');
    for (const chainEvents of chains) {
      const summary = chainEvents.map(e => {
        const cellsLen = (e as any).cells ? (e as any).cells.length : 0;
        return { type: e.type, chain: (e as any).chain, cells: cellsLen };
      });
      console.log('✨ [INTERIM] chain step', summary);
      setEvents(chainEvents);
      // Haptics per chain step for feedback
      if (opts?.hapticsEnabled !== false) {
        const hasBomb = chainEvents.some(e => e.type === 'bomb');
        const hasClear = chainEvents.some(e => e.type === 'clear');
        if (hasBomb) {
          // Stronger feedback for bomb
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (hasClear) {
          // Lighter tick for clears
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          Haptics.selectionAsync();
        }
      }
      // give time for animations (clear/bomb) to play
      await new Promise(r => setTimeout(r, 350));
      console.log('⏭️ [INTERIM] chain step done');
    }
    setEvents([]);
    setIsResolving(false);
    console.log('🔓 [INTERIM] isResolving=false');
  }

  // Helper: insert a new row at bottom and shift up
  const raiseHandRow = useCallback(() => {
    const s = stateRef.current;
    const newGrid = s.grid.map(r => r.slice());
    // generate a bottom row
    const bottom: ({ type: BlockType } | null)[] = Array.from({ length: newGrid[0].length }, () => {
      const r = Math.random();
      if (r < 0.15) return { type: BlockType.STAR };
      if (r < 0.45) return { type: [BlockType.RICK, BlockType.COO, BlockType.KINE][Math.floor(Math.random()*3)] };
      return null;
    });
    // shift up
    newGrid.shift();
    newGrid.push(bottom);
    // if top row had blocks before shift (i.e., after shift anything null? handled above), detect overflow
    const overflow = newGrid[0].some(c => !!c);
    stateRef.current = { ...s, grid: newGrid } as EngineState;
    setGrid(overlayPair(newGrid, stateRef.current.falling));
    if (overflow) setGameOver(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    let accumulated = 0;
    const tickMs = 450; // fixed tick duration
    let lastTs = Date.now();

    const loop = () => {
      if (!active || gameOver) return;
      const now = Date.now();
      accumulated += now - lastTs;
      lastTs = now;
      while (accumulated >= tickMs) {
        // During interim resolution, do not advance engine state (prevents new spawns during chains)
        if (isResolving) {
          accumulated = 0; // drop backlog to keep timing stable
          break;
        }
        const result = tick(stateRef.current);
        stateRef.current = {
          grid: result.grid,
          falling: result.falling,
          next: result.next,
          hold: result.hold,
          canHold: result.canHold,
          seed: stateRef.current.seed,
          rng: stateRef.current.rng,
        } as EngineState;
        if (result.gameOver) {
          setGameOver(true);
        }
        const stars = result.scoredStars || 0;
        const chainCount = result.chains || 0;
        if (stars > 0) {
          setScore((s) => {
            console.log('🎯 [SCORE]', { added: stars, total: s + stars, chains: chainCount });
            return s + stars;
          });
          setChains(chainCount);
          if (opts?.hapticsEnabled !== false) {
            if (chainCount > 1) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } else if (chainCount === 0) {
          setChains(0);
        }
        const ev = (result.events || []) as GameEvent[];
        setEvents(ev);
        // Kick off interim sequencing (non-blocking)
        if ((result.chains || 0) > 0) {
          // fire-and-forget; we intentionally don't await inside RAF loop
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          playInterim(ev);
        }
        // SFX & Haptics hooks
        ev.forEach(e => {
          if (e.type === 'lock') {
            // audio.playSfxAsync('lock', require('../../assets/lock.wav'));
            if (opts?.hapticsEnabled !== false) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else if (e.type === 'clear') {
            // audio.playSfxAsync('clear', require('../../assets/clear.wav'));
            if (opts?.hapticsEnabled !== false) Haptics.selectionAsync();
          } else if (e.type === 'bomb') {
            // audio.playSfxAsync('bomb', require('../../assets/bomb.wav'));
            if (opts?.hapticsEnabled !== false) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        });
        setNext(stateRef.current.next as unknown as [string, string]);
        setHold(stateRef.current.hold as unknown as [string, string] | null);
        setCanHold(stateRef.current.canHold);
        setGhost(getGhostPositions(stateRef.current.grid, stateRef.current.falling));
        setFallingPositions(stateRef.current.falling ? pairPositions(stateRef.current.falling) : []);
        setGrid(overlayPair(stateRef.current.grid, stateRef.current.falling));
        accumulated -= tickMs;
      }
      timer.current = requestAnimationFrame(loop);
    };
    timer.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(timer.current);
  }, [active, gameOver, isResolving]);

  // Challenge mode hand-raise
  useEffect(() => {
    if (!active || mode !== 'challenge') return;
    const schedule = () => {
      if (gameOver) return;
      handTimer.current = setTimeout(() => {
        raiseHandRow();
        // accelerate down to a floor
        handIntervalMs.current = Math.max(3000, handIntervalMs.current - 500);
        schedule();
      }, handIntervalMs.current);
    };
    schedule();
    return () => handTimer.current && clearTimeout(handTimer.current);
  }, [active, mode, gameOver, raiseHandRow]);

  // Time Attack timer
  useEffect(() => {
    if (!active || mode !== 'timeAttack') return;
    const int = setInterval(() => {
      setTimeLeft((t) => {
        if (t === undefined) return t;
        if (t <= 1) {
          setGameOver(true);
          clearInterval(int);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(int);
  }, [active, mode]);

  const moveLeft = useCallback(() => {
    if (gameOver) return;
    const s = stateRef.current;
    if (s.falling) s.falling = movePair(s.grid, s.falling, -1, 0);
    setGhost(getGhostPositions(s.grid, s.falling));
    setFallingPositions(s.falling ? pairPositions(s.falling) : []);
    setGrid(overlayPair(s.grid, s.falling));
  }, [gameOver]);
  const moveRight = useCallback(() => {
    if (gameOver) return;
    const s = stateRef.current;
    if (s.falling) s.falling = movePair(s.grid, s.falling, 1, 0);
    setGhost(getGhostPositions(s.grid, s.falling));
    setFallingPositions(s.falling ? pairPositions(s.falling) : []);
    setGrid(overlayPair(s.grid, s.falling));
  }, [gameOver]);
  const softDrop = useCallback(() => {
    if (gameOver) return;
    const s = stateRef.current;
    if (s.falling) s.falling = movePair(s.grid, s.falling, 0, 1);
    setGhost(getGhostPositions(s.grid, s.falling));
    setFallingPositions(s.falling ? pairPositions(s.falling) : []);
    setGrid(overlayPair(s.grid, s.falling));
  }, [gameOver]);
  const rotate = useCallback(() => {
    if (gameOver) return;
    const s = stateRef.current;
    if (s.falling) s.falling = rotatePair(s.grid, s.falling);
    // Haptics on rotate
    if (opts?.hapticsEnabled !== false) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Haptics.selectionAsync();
    }
    setGhost(getGhostPositions(s.grid, s.falling));
    setFallingPositions(s.falling ? pairPositions(s.falling) : []);
    setGrid(overlayPair(s.grid, s.falling));
  }, [gameOver]);
  const holdAction = useCallback(() => {
    if (gameOver) return;
    const s = stateRef.current;
    const newState = holdSwap(s);
    stateRef.current = newState;
    setHold(newState.hold as unknown as [string, string] | null);
    setCanHold(newState.canHold);
    setGhost(getGhostPositions(newState.grid, newState.falling));
    setFallingPositions(newState.falling ? pairPositions(newState.falling) : []);
    setGrid(overlayPair(newState.grid, newState.falling));
  }, [gameOver]);

  const hardDrop = useCallback(() => {
    if (gameOver) return;
    const s = stateRef.current;
    if (!s.falling) return;
    const startY = s.falling.y;
    // Drop to lowest valid position
    while (canMove(s.grid, s.falling, 0, 1)) {
      s.falling = { ...s.falling, y: s.falling.y + 1 };
    }
    const dropDistance = s.falling.y - startY;
    console.log('⚡ [HARD DROP]', { from: startY, to: s.falling.y, distance: s.falling.y - startY });
    // Build trail from start to final
    const trail: { x: number; y: number }[] = [];
    for (let y = startY; y <= s.falling.y; y++) {
      const temp = { ...s.falling, y } as typeof s.falling;
      pairPositions(temp).forEach(p => trail.push(p));
    }
    setDropTrail(trail);
    if (dropTrailTimer.current) clearTimeout(dropTrailTimer.current);
    dropTrailTimer.current = setTimeout(() => setDropTrail([]), 180);
    setShake(true);
    setTimeout(() => setShake(false), 120);
    setGhost(getGhostPositions(s.grid, s.falling));
    setFallingPositions(s.falling ? pairPositions(s.falling) : []);
    setGrid(overlayPair(s.grid, s.falling));
    // Advance one tick to lock and resolve
    const result = tick(s);
    stateRef.current = {
      grid: result.grid,
      falling: result.falling,
      next: result.next,
      hold: result.hold,
      canHold: result.canHold,
      seed: stateRef.current.seed,
      rng: stateRef.current.rng,
    } as EngineState;
    if (result.gameOver) {
      setGameOver(true);
    }
    // Big haptic on landing from a quick drop
    if (dropDistance > 0 && opts?.hapticsEnabled !== false) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    const stars = result.scoredStars || 0;
    const chainCount = result.chains || 0;
    if (stars > 0) {
      setScore((sc) => sc + stars);
      setChains(chainCount);
      if (opts?.hapticsEnabled !== false) {
        if (chainCount > 1) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else if (chainCount === 0) {
      setChains(0);
    }
    setEvents((result.events || []) as GameEvent[]);
    setNext(stateRef.current.next as unknown as [string, string]);
    setHold(stateRef.current.hold as unknown as [string, string] | null);
    setCanHold(stateRef.current.canHold);
    setGhost(getGhostPositions(stateRef.current.grid, stateRef.current.falling));
    setFallingPositions(stateRef.current.falling ? pairPositions(stateRef.current.falling) : []);
    setGrid(overlayPair(stateRef.current.grid, stateRef.current.falling));
  }, [gameOver, opts?.hapticsEnabled]);

  const restart = useCallback(() => {
    const nextSeed = opts?.sameSeed ? stateRef.current.seed : Math.floor(Math.random() * 0x7fffffff);
    setSeed(nextSeed);
    const init = initialEngineState(nextSeed);
    stateRef.current = init;
    setGrid(init.grid);
    setScore(0);
    setChains(0);
    setGhost([]);
    setNext(init.next as unknown as [string, string]);
    setHold(init.hold as unknown as [string, string] | null);
    setCanHold(init.canHold);
    setTimeLeft(mode === 'timeAttack' ? 180 : undefined);
    setGameOver(false);
    setEvents([]);
    setFallingPositions([]);
    setDropTrail([]);
    setShake(false);
  }, [mode, opts?.sameSeed]);

  return { grid, score, chains, ghost, fallingPositions, dropTrail, shake, moveLeft, moveRight, softDrop, rotate, holdAction, hardDrop, restart, next, hold, canHold, timeLeft, gameOver, events, seed, isResolving } as const;
}
