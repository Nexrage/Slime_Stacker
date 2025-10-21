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
  const [bonusStars, setBonusStars] = useState<{ x: number; y: number; currentY: number }[]>([]);
  // isResolving removed - clearing phase now pauses via setTimeout

  const timer = useRef<any>(null);
  const handTimer = useRef<any>(null);
  const handIntervalMs = useRef<number>(10000);
  const stateRef = useRef<EngineState>(initialEngineState(seed));
  // Clearing-phase UI ack: freeze ticks until UI reports completion
  const awaitingClearingRef = useRef<boolean>(false);
  const [clearingToken, setClearingToken] = useState<number | null>(null);

  // Old interim system removed - animations now happen in real-time during clearing phase

  // Helper: insert a new row at bottom and shift up
  const raiseHandRow = useCallback(() => {
    const s = stateRef.current;
    const newGrid = s.grid.map(r => r.slice());
    // generate a bottom row
    const bottom: ({ type: BlockType } | null)[] = Array.from({ length: newGrid[0].length }, () => {
      const r = Math.random();
      // No empties for challenge-mode helper: 30% Star, 60% Friend, 10% Brick
      if (r < 0.3) return { type: BlockType.STAR };
      if (r < 0.9) return { type: [BlockType.GREEN_JELLY, BlockType.RED_JELLY, BlockType.BLUE_JELLY][Math.floor(Math.random()*3)] };
      return { type: BlockType.BRICK };
    });
    // full brick row above the random row
    const brickRow: ({ type: BlockType })[] = Array.from({ length: newGrid[0].length }, () => ({ type: BlockType.BRICK }));
    // shift up by two and push rows (Brick above RNG; RNG is the bottom-most of the two)
    newGrid.shift();
    newGrid.shift();
    newGrid.push(brickRow as any);
    newGrid.push(bottom as any);
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
        // Do not advance the engine while waiting for clearing animation ack
        if (awaitingClearingRef.current) {
          accumulated = 0;
          break;
        }

        const result = tick(stateRef.current);
        
        // If entering clearing phase, pause ticks and wait for UI callback
        if (result.phase.type === 'clearing' && stateRef.current.phase.type !== 'clearing') {
          console.log('⏸️ [PAUSE] Entering clearing phase - playing clear animation');
          setEvents(result.events || []);
          stateRef.current = {
            grid: result.grid,
            falling: result.falling,
            next: result.next,
            hold: result.hold,
            canHold: result.canHold,
            seed: stateRef.current.seed,
            rng: stateRef.current.rng,
            phase: result.phase,
            chainState: stateRef.current.chainState,
          } as EngineState;
          // Generate a token for this clearing session and freeze the loop
          const token = Date.now() ^ Math.floor(Math.random() * 0x7fffffff);
          setClearingToken(token);
          awaitingClearingRef.current = true;
          // Stop consuming ticks until UI acks
          accumulated = 0;
          break;
        }
        stateRef.current = {
          grid: result.grid,
          falling: result.falling,
          next: result.next,
          hold: result.hold,
          canHold: result.canHold,
          seed: stateRef.current.seed,
          rng: stateRef.current.rng,
          phase: result.phase,
          chainState: result.phase.type === 'falling' ? { totalStars: 0, chainCount: 0, clearedGrid: null } : stateRef.current.chainState,
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
        // SFX & Haptics for events (only when not in clearing phase pause)
        const ev = (result.events || []) as GameEvent[];
        if (ev.length > 0 && result.phase.type !== 'clearing') {
          ev.forEach(e => {
            if (e.type === 'clear') {
              // audio.playSfxAsync('clear', require('../../assets/clear.wav'));
              if (opts?.hapticsEnabled !== false) Haptics.selectionAsync();
            } else if (e.type === 'bomb') {
              // audio.playSfxAsync('bomb', require('../../assets/bomb.wav'));
              if (opts?.hapticsEnabled !== false) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
          });
        }
        setNext(stateRef.current.next as unknown as [string, string]);
        setHold(stateRef.current.hold as unknown as [string, string] | null);
        setCanHold(stateRef.current.canHold);
        setGhost(getGhostPositions(stateRef.current.grid, stateRef.current.falling));
        setFallingPositions(stateRef.current.falling ? pairPositions(stateRef.current.falling) : []);
        setBonusStars(stateRef.current.phase.type === 'bonusStars' ? stateRef.current.phase.starPositions : []);
        setGrid(overlayPair(stateRef.current.grid, stateRef.current.falling));
        accumulated -= tickMs;
      }
      timer.current = requestAnimationFrame(loop);
    };
    timer.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(timer.current);
  }, [active, gameOver]);

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
    setBonusStars(s.phase.type === 'bonusStars' ? s.phase.starPositions : []);
    setGrid(overlayPair(s.grid, s.falling));
  }, [gameOver]);
  const moveRight = useCallback(() => {
    if (gameOver) return;
    const s = stateRef.current;
    if (s.falling) s.falling = movePair(s.grid, s.falling, 1, 0);
    setGhost(getGhostPositions(s.grid, s.falling));
    setFallingPositions(s.falling ? pairPositions(s.falling) : []);
    setBonusStars(s.phase.type === 'bonusStars' ? s.phase.starPositions : []);
    setGrid(overlayPair(s.grid, s.falling));
  }, [gameOver]);
  const softDrop = useCallback(() => {
    if (gameOver) return;
    const s = stateRef.current;
    if (s.falling) s.falling = movePair(s.grid, s.falling, 0, 1);
    setGhost(getGhostPositions(s.grid, s.falling));
    setFallingPositions(s.falling ? pairPositions(s.falling) : []);
    setBonusStars(s.phase.type === 'bonusStars' ? s.phase.starPositions : []);
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
    setBonusStars(s.phase.type === 'bonusStars' ? s.phase.starPositions : []);
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
    setBonusStars(newState.phase.type === 'bonusStars' ? newState.phase.starPositions : []);
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
    setBonusStars(s.phase.type === 'bonusStars' ? s.phase.starPositions : []);
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
      phase: result.phase,
      chainState: result.phase.type === 'falling' ? { totalStars: 0, chainCount: 0, clearedGrid: null } : stateRef.current.chainState,
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
    // Events handled in clearing phase now
    setNext(stateRef.current.next as unknown as [string, string]);
    setHold(stateRef.current.hold as unknown as [string, string] | null);
    setCanHold(stateRef.current.canHold);
    setGhost(getGhostPositions(stateRef.current.grid, stateRef.current.falling));
    setFallingPositions(stateRef.current.falling ? pairPositions(stateRef.current.falling) : []);
    setBonusStars(stateRef.current.phase.type === 'bonusStars' ? stateRef.current.phase.starPositions : []);
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
    setBonusStars([]);
    setDropTrail([]);
    setShake(false);
  }, [mode, opts?.sameSeed]);

  // UI calls this after it has presented the clearing animation at least once
  const notifyClearingComplete = useCallback((token?: number | null) => {
    // Only act if we are actually paused for clearing and token matches (if provided)
    if (!awaitingClearingRef.current) return;
    if (clearingToken != null && token != null && token !== clearingToken) return;
    console.log('▶️ [RESUME] Clear animation complete - continuing (ack)');
    setEvents([]);
    awaitingClearingRef.current = false;
    setClearingToken(null);

    // Advance one engine tick to exit clearing
    const continueResult = tick(stateRef.current);
    stateRef.current = {
      grid: continueResult.grid,
      falling: continueResult.falling,
      next: continueResult.next,
      hold: continueResult.hold,
      canHold: continueResult.canHold,
      seed: stateRef.current.seed,
      rng: stateRef.current.rng,
      phase: continueResult.phase,
      chainState: stateRef.current.chainState,
    } as EngineState;
    setGrid(overlayPair(continueResult.grid, continueResult.falling));
  }, [clearingToken]);

  return { grid, score, chains, ghost, fallingPositions, dropTrail, shake, bonusStars, moveLeft, moveRight, softDrop, rotate, holdAction, hardDrop, restart, next, hold, canHold, timeLeft, gameOver, events, seed, notifyClearingComplete, clearingToken } as const;
}
