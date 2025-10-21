import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Box, Image, Spinner, Text } from '@gluestack-ui/themed';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';
import { BlockCell, BlockType } from '@/game/BlockTypes';
import { GRID_COLS, GRID_ROWS } from '@/utils/constants';

const imageForBlockCell = (cell: BlockCell) => {
  if (!cell) return null;

  switch (cell.type) {
    case BlockType.GREEN_JELLY:
      return require('../../assets/sprites/gifs/jelly-idle.gif');
    case BlockType.RED_JELLY:
      return require('../../assets/sprites/gifs/red-jelly-idle.gif');
    case BlockType.BLUE_JELLY:
      return require('../../assets/sprites/gifs/blue-jelly-idle.gif');
    case BlockType.STAR:
      return require('../../assets/sprites/icons/tile191.png');
    case BlockType.BRICK:
      // Use cracked visual when available (driven via 'cracked' prop downstream)
      return require('../../assets/sprites/block.png');
    case BlockType.BOMB:
      return require('../../assets/sprites/bomb.png');
    default:
      return require('../../assets/icon.png');
  }
};

const imageForBlockCellBob = (type: BlockType | null, frame: 0 | 1) => {
  if (!type) return null;
  switch (type) {
    case BlockType.GREEN_JELLY:
      return require('../../assets/sprites/gifs/jelly-idle.gif');
    case BlockType.RED_JELLY:
      return require('../../assets/sprites/gifs/red-jelly-idle.gif');
    case BlockType.BLUE_JELLY:
      return require('../../assets/sprites/gifs/blue-jelly-idle.gif');
    case BlockType.STAR:
      return require('../../assets/sprites/icons/tile191.png');
    case BlockType.BRICK:
      return require('../../assets/sprites/block.png');
    case BlockType.BOMB:
      return require('../../assets/sprites/bomb.png');
    default:
      return require('../../assets/icon.png');
  }
};

const imageForBlockCellFlash = (cell: BlockCell, frame: 0 | 1) => {
  if (!cell) return null;
  switch (cell.type) {
    case BlockType.GREEN_JELLY:
      return require('../../assets/sprites/gifs/jelly-green-kill.gif');
    case BlockType.RED_JELLY:
      return require('../../assets/sprites/gifs/jelly-red-kill.gif');
    case BlockType.BLUE_JELLY:
      return require('../../assets/sprites/gifs/blue-jelly-kill.gif');
    case BlockType.STAR:
      // No dedicated star flash frames in assets; reuse tile191.png for both frames
      return require('../../assets/sprites/icons/tile191.png');
    case BlockType.BRICK:
      // Brick has a single flash frame
      return require('../../assets/sprites/brick_flash_1.png');
    case BlockType.BOMB:
      // Bomb has a single flash frame
      return require('../../assets/sprites/bomb_flash_1.png');
    default:
      return require('../../assets/icon.png');
  }
};

interface ClearingState {
  isClearing: boolean;
  chainNumber?: number;
}

const Cell: React.FC<{
  blockType: BlockType | null;
  w: number;
  h: number;
  shake: boolean;
  clearing?: ClearingState;
  bobFrame?: 0 | 1;
  cracked?: boolean;
}> = ({ blockType, w, h, shake, clearing, bobFrame = 0, cracked = false }) => {
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  // Clearing animation: blink during most of the window, subtle fade near the end
  useEffect(() => {
    let blinkInt: any;
    let fadeTo: any;
    if (clearing?.isClearing) {
      console.log(
        '🎬 [ANIMATION] Clear block animation (blink + subtle end fade)',
        clearing.chainNumber ? `with chain ${clearing.chainNumber}` : ''
      );
      // Start at full opacity
      opacity.value = 1;
      // Blink between 1 and ~0.7 quickly
      blinkInt = setInterval(() => {
        const next = opacity.value < 0.9 ? 1 : 0.7;
        opacity.value = withTiming(next, { duration: 90 });
      }, 140);
      // Subtle fade near the end of the clearing window (assumes ~1700ms total)
      fadeTo = setTimeout(() => {
        if (blinkInt) {
          clearInterval(blinkInt);
          blinkInt = null;
        }
        opacity.value = withTiming(0.4, { duration: 260 });
      }, 1500);
    } else {
      if (blinkInt) clearInterval(blinkInt);
      if (fadeTo) clearTimeout(fadeTo);
      opacity.value = withTiming(1, { duration: 120 });
    }
    return () => {
      if (blinkInt) clearInterval(blinkInt);
      if (fadeTo) clearTimeout(fadeTo);
    };
  }, [clearing?.isClearing]);

  useEffect(() => {
    if (shake) {
      translateX.value = withSequence(
        withTiming(-3, { duration: 30 }),
        withTiming(3, { duration: 60 }),
        withTiming(0, { duration: 30 })
      );
    } else {
      translateX.value = withTiming(0, { duration: 120 });
    }
  }, [shake]);

  const imageSource = clearing?.isClearing
    ? imageForBlockCellFlash(blockType ? { type: blockType } : null, 0)
    : blockType === BlockType.BRICK && cracked
    ? require('../../assets/sprites/brick_flash_1.png')
    : imageForBlockCellBob(blockType || null, bobFrame);

  return (
    <Animated.View
      style={[{ width: w, height: h, borderRadius: 4, overflow: 'hidden' }, animatedStyle]}
    >
      {clearing?.isClearing && clearing.chainNumber ? (
        <Box
          style={{
            width: w,
            height: h,
            backgroundColor: '#333',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
          }}
        >
          <Spinner size="small" color="$primary500" />
          <Text
            size="xs"
            color="$white"
            style={{
              position: 'absolute',
              fontSize: Math.max(8, w * 0.3),
              fontWeight: 'bold',
            }}
          >
            {clearing.chainNumber}
          </Text>
        </Box>
      ) : imageSource ? (
        <Image source={imageSource} alt="Block" style={{ width: w, height: h }} />
      ) : (
        <Box style={{ width: w, height: h, backgroundColor: '#111' }} />
      )}
    </Animated.View>
  );
};

export const GameBoard: React.FC<{
  grid: BlockCell[][];
  ghost?: { x: number; y: number }[];
  falling?: { x: number; y: number }[];
  dropTrail?: { x: number; y: number }[];
  shakeBoard?: boolean;
  events?: { type: string; [k: string]: any }[];
  bonusStars?: { x: number; y: number; currentY: number }[];
  clearingToken?: number | null;
  onClearingComplete?: (token?: number | null) => void;
}> = ({
  grid,
  ghost = [],
  falling = [],
  dropTrail = [],
  shakeBoard = false,
  events = [],
  bonusStars = [],
  clearingToken = null,
  onClearingComplete,
}) => {
  const [container, setContainer] = React.useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const onLayout = React.useCallback((e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setContainer({ width, height });
  }, []);
  const isGhost = (x: number, y: number) => ghost.some(p => p.x === x && p.y === y);
  const isFalling = (x: number, y: number) => falling.some(p => p.x === x && p.y === y);
  const isTrail = (x: number, y: number) => dropTrail.some(p => p.x === x && p.y === y);
  const isBonusStar = (x: number, y: number) => bonusStars.some(s => s.x === x && s.currentY === y);

  // Log bonus stars when they appear
  useEffect(() => {
    if (bonusStars.length > 0) {
      console.log(
        '🎬 [ANIMATION] Bonus stars falling:',
        bonusStars.map(s => `(${s.x},${s.currentY}→${s.y})`)
      );
    }
  }, [bonusStars]);
  // Removed clearingPositions - flash handles the entire clear animation now
  const bombRows = useMemo(() => {
    const rows = new Set<number>();
    events.forEach(e => {
      if (e.type === 'bomb') {
        console.log('🎬 [ANIMATION] Bomb animation for rows:', e.rows);
        e.rows.forEach((r: number) => rows.add(r));
      }
    });
    return rows;
  }, [events]);
  const gravityFalls = useMemo(() => {
    // Map destination key "x,y" -> number of cells fallen
    const map = new Map<string, number>();
    events.forEach(e => {
      if (e.type === 'gravity' && Array.isArray((e as any).falls)) {
        const falls = (e as any).falls as { x: number; fromY: number; toY: number }[];
        console.log(
          '🎬 [ANIMATION] Gravity animation for falls:',
          falls.map(f => `(${f.x},${f.fromY}→${f.toY})`)
        );
        falls.forEach(f => {
          const key = `${f.x},${f.toY}`;
          const dy = Math.max(0, f.toY - f.fromY);
          if (dy > 0) map.set(key, dy);
        });
      }
    });
    return map;
  }, [events]);
  const flashTargets = useMemo(() => {
    const set = new Set<string>();
    const hasFlashEvents = events.some(
      e => (e.type === 'clear' || e.type === 'bomb') && (e as any).cells
    );
    if (hasFlashEvents) {
      console.log('🎬 [ANIMATION] Flash animation triggered');
    }
    events.forEach(e => {
      if (e.type === 'clear' || e.type === 'bomb') {
        const cells = (e as any).cells as { x: number; y: number }[] | undefined;
        if (cells) cells.forEach(c => set.add(`${c.x},${c.y}`));
      }
    });
    if (set.size > 0) {
      console.log('[FLASH] targets', Array.from(set).slice(0, 12));
    }
    return set;
  }, [events]);

  // After first paint of clearing visuals, wait for kill GIF(s) duration, then ack back to engine
  const lastAckedTokenRef = useRef<number | null>(null);
  useEffect(() => {
    if (!onClearingComplete) return;
    const hasClears = flashTargets.size > 0;
    if (!hasClears) return;
    if (clearingToken != null && lastAckedTokenRef.current === clearingToken) return;

    // Fixed duration for kill GIF playback window
    let maxDuration = 1700;

    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        const to = setTimeout(() => {
          onClearingComplete(clearingToken);
          if (clearingToken != null) lastAckedTokenRef.current = clearingToken;
        }, maxDuration);
        // Store handle for cleanup via closure
        (onClearingComplete as any).__clear_to = to;
      });
      void id2; // silence unused in TS
    });
    return () => {
      cancelAnimationFrame(id1);
      const to = (onClearingComplete as any).__clear_to as
        | ReturnType<typeof setTimeout>
        | undefined;
      if (to) clearTimeout(to);
    };
  }, [flashTargets.size, clearingToken, onClearingComplete, flashTypeMap]);
  const flashTypeMap = useMemo(() => {
    const map = new Map<string, BlockType>();
    events.forEach(e => {
      if (e.type === 'clear' || e.type === 'bomb') {
        const cells = (e as any).cells as { x: number; y: number; type: BlockType }[] | undefined;
        if (cells) cells.forEach(c => map.set(`${c.x},${c.y}`, c.type));
      }
    });
    return map;
  }, [events]);

  const flashChainMap = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach(e => {
      if (e.type === 'clear' || e.type === 'bomb') {
        const cells = (e as any).cells as { x: number; y: number }[] | undefined;
        const chain = (e as any).chain as number | undefined;
        // Only show spinner for chains > 1, and only on the first cell of each chain
        if (cells && chain && chain > 1) {
          // Pick the first cell to show the spinner
          const firstCell = cells[0];
          if (firstCell) {
            map.set(`${firstCell.x},${firstCell.y}`, chain);
          }
        }
      }
    });
    return map;
  }, [events]);
  const boardTx = useSharedValue(0);
  const boardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: boardTx.value }] }));
  const [globalBobFrame, setGlobalBobFrame] = React.useState<0 | 1>(0);
  useEffect(() => {
    if (shakeBoard) {
      boardTx.value = withSequence(
        withTiming(-4, { duration: 30 }),
        withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 30 })
      );
    } else {
      boardTx.value = withTiming(0, { duration: 120 });
    }
  }, [shakeBoard]);

  // Global bob ticker so falling pair frames change visibly
  useEffect(() => {
    const int = setInterval(() => {
      setGlobalBobFrame(prev => (prev === 0 ? 1 : 0));
    }, 320);
    return () => clearInterval(int);
  }, []);

  // Dynamic sizing - fill container completely
  const cols = grid[0]?.length || GRID_COLS;
  const rows = grid.length || GRID_ROWS;
  const boardPadding = 8;
  const cellGap = 3;

  // Use container dimensions directly (SafeAreaView already handles insets)
  const availableWidth = container.width;
  const availableHeight = container.height;

  // Calculate max cell size that fits
  const cellSizeW = (availableWidth - (cols - 1) * cellGap - boardPadding * 2) / cols;
  const cellSizeH = (availableHeight - (rows - 1) * cellGap - boardPadding * 2) / rows;
  const cellSize = Math.floor(Math.min(cellSizeW, cellSizeH || 0));

  const boardPixelWidth = cols * cellSize + (cols - 1) * cellGap + boardPadding * 2;
  const boardPixelHeight = rows * cellSize + (rows - 1) * cellGap + boardPadding * 2;

  return (
    <Box
      onLayout={onLayout}
      flex={1}
      width="$full"
      height="$full"
      alignItems="center"
      justifyContent="center"
    >
      <Animated.View
        style={[
          {
            width: boardPixelWidth,
            height: boardPixelHeight,
            padding: boardPadding,
            backgroundColor: '#222',
            borderRadius: 8,
          },
          boardStyle,
        ]}
      >
        {grid.map((row, y) => (
          <Box key={y} style={{ flexDirection: 'row' }}>
            {row.map((cell, x) => {
              const ghostCell = isGhost(x, y) && !cell;
              const trailCell = isTrail(x, y) && !cell;
              const bonusStarCell = isBonusStar(x, y);
              const keyStr = `${x},${y}`;
              const shake = bombRows.has(y);
              const fallAnim = isFalling(x, y) || bonusStarCell; // Bonus stars also animate like falling pieces
              const flash = flashTargets.has(keyStr);
              const baseType = cell?.type || null;
              const cracked = (cell as any)?.cracked === true;
              const renderType = flash ? flashTypeMap.get(keyStr) ?? baseType : baseType;
              const chainNumber = flash ? flashChainMap.get(keyStr) : undefined;

              // Consolidated clearing state
              const clearing: ClearingState | undefined = flash
                ? {
                    isClearing: true,
                    chainNumber: chainNumber,
                  }
                : undefined;
              // For ghost/trail, show empty or faint overlay; if flashing, force render; bonus stars always visible
              const displayType = bonusStarCell
                ? BlockType.STAR
                : flash
                ? renderType
                : ghostCell || trailCell
                ? null
                : renderType;

              // Gravity fall amount for this destination cell (in cells)
              const gravityDyCells = gravityFalls.get(keyStr) || 0;
              const gravityDyPx = gravityDyCells > 0 ? gravityDyCells * cellSize : 0;

              // During interim chain step, bob cells that are about to fall (have empty space below)
              const isInterim = Array.isArray(events) && events.length > 0;
              const hasEmptyBelow = y + 1 < rows && !grid[y + 1][x];
              const shouldBob = fallAnim || (isInterim && hasEmptyBelow && !!baseType && !flash);

              return (
                <Box
                  key={x}
                  style={{
                    marginRight: x < cols - 1 ? cellGap : 0,
                    marginBottom: y < rows - 1 ? cellGap : 0,
                    opacity: flash ? 1 : ghostCell ? 0.3 : trailCell ? 0.15 : 1,
                  }}
                >
                  <GravityWrapper offsetPx={gravityDyPx} durationMs={350}>
                    <FallingWrapper active={fallAnim} cellSize={cellSize}>
                      <Cell
                        blockType={displayType}
                        w={cellSize}
                        h={cellSize}
                        shake={shake}
                        clearing={clearing}
                        bobFrame={shouldBob ? globalBobFrame : 0}
                        cracked={cracked}
                      />
                    </FallingWrapper>
                  </GravityWrapper>
                </Box>
              );
            })}
          </Box>
        ))}
      </Animated.View>
    </Box>
  );
};

const FallingWrapper: React.FC<{ active: boolean; cellSize: number; children: React.ReactNode }> =
  React.memo(({ active, cellSize, children }) => {
    const scale = useSharedValue(1);
    const brightness = useSharedValue(1);

    const style = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: brightness.value,
    }));

    useEffect(() => {
      if (active) {
        console.log('🎬 [ANIMATION] Falling piece pulse animation started');
        // Subtle pulsing effect to indicate active falling piece
        scale.value = withRepeat(
          withSequence(withTiming(1.05, { duration: 300 }), withTiming(1.0, { duration: 300 })),
          -1, // infinite
          true // reverse
        );
        brightness.value = withTiming(1.1, { duration: 150 });
      } else {
        // Stop animation and reset
        scale.value = withSpring(1, {
          damping: 10,
          stiffness: 150,
        });
        brightness.value = withTiming(1, { duration: 100 });
      }
    }, [active]);

    return <Animated.View style={style}>{children}</Animated.View>;
  });

const GravityWrapper: React.FC<{
  offsetPx: number;
  durationMs: number;
  children: React.ReactNode;
}> = ({ offsetPx, durationMs, children }) => {
  const ty = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  useEffect(() => {
    if (offsetPx > 0) {
      console.log(`🎬 [ANIMATION] Gravity drop animation: ${offsetPx}px over ${durationMs}ms`);
      ty.value = -offsetPx; // start above destination by the fall distance
      ty.value = withTiming(0, { duration: durationMs });
    } else {
      ty.value = 0;
    }
  }, [offsetPx, durationMs]);
  return <Animated.View style={style}>{children}</Animated.View>;
};
