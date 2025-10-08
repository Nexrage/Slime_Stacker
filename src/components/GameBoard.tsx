import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Box, Image } from '@gluestack-ui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    case BlockType.RICK:
      return require('../../assets/sprites/hamster.png');
    case BlockType.COO:
      return require('../../assets/sprites/bird.png');
    case BlockType.KINE:
      return require('../../assets/sprites/fish.png');
    case BlockType.STAR:
      return require('../../assets/sprites/star.png');
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
    case BlockType.RICK:
      return frame === 0
        ? require('../../assets/sprites/hamster.png')
        : require('../../assets/sprites/hamster_bob.png');
    case BlockType.COO:
      return frame === 0
        ? require('../../assets/sprites/bird.png')
        : require('../../assets/sprites/bird_bob.png');
    case BlockType.KINE:
      return frame === 0
        ? require('../../assets/sprites/fish.png')
        : require('../../assets/sprites/fish_bob.png');
    case BlockType.STAR:
      return require('../../assets/sprites/star.png');
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
    case BlockType.RICK:
      return frame === 0
        ? require('../../assets/sprites/hamster_flash_1.png')
        : require('../../assets/sprites/hamster_flash_2.png');
    case BlockType.COO:
      return frame === 0
        ? require('../../assets/sprites/bird_flash_1.png')
        : require('../../assets/sprites/bird_flash_2.png');
    case BlockType.KINE:
      return frame === 0
        ? require('../../assets/sprites/fish_flash_1.png')
        : require('../../assets/sprites/fish_flash_2.png');
    case BlockType.STAR:
      // No dedicated star flash frames in assets; reuse star.png for both frames
      return require('../../assets/sprites/star_flash.png');
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

const Cell: React.FC<{
  blockType: BlockType | null;
  w: number;
  h: number;
  isClearing: boolean;
  shake: boolean;
  flash?: boolean;
  bobFrame?: 0 | 1;
  cracked?: boolean;
}> = ({ blockType, w, h, isClearing, shake, flash, bobFrame = 0, cracked }) => {
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const [flashFrame, setFlashFrame] = useState<0 | 1>(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));
  useEffect(() => {
    if (isClearing) {
      opacity.value = withSequence(
        withTiming(0.2, { duration: 60 }),
        withTiming(1, { duration: 60 }),
        withTiming(0, { duration: 180 })
      );
    } else {
      opacity.value = withTiming(1, { duration: 120 });
    }
  }, [isClearing]);
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

  useEffect(() => {
    let int: any;
    if (flash) {
      setFlashFrame(0);
      int = setInterval(() => {
        setFlashFrame(prev => (prev === 0 ? 1 : 0));
      }, 1000);
    } else {
      setFlashFrame(0);
    }
    return () => int && clearInterval(int);
  }, [flash]);

  const imageSource = flash
    ? imageForBlockCellFlash(blockType ? { type: blockType } : null, flashFrame)
    : blockType === BlockType.BRICK && cracked
    ? require('../../assets/sprites/brick_flash_1.png')
    : imageForBlockCellBob(blockType || null, bobFrame);

  return (
    <Animated.View
      style={[{ width: w, height: h, borderRadius: 4, overflow: 'hidden' }, animatedStyle]}
    >
      {imageSource ? (
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
}> = ({ grid, ghost = [], falling = [], dropTrail = [], shakeBoard = false, events = [] }) => {
  const insets = useSafeAreaInsets();
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
  const clearingPositions = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      if (e.type === 'clear') {
        e.positions.forEach((p: { x: number; y: number }) => set.add(`${p.x},${p.y}`));
      }
    });
    return set;
  }, [events]);
  const bombRows = useMemo(() => {
    const rows = new Set<number>();
    events.forEach(e => {
      if (e.type === 'bomb') e.rows.forEach((r: number) => rows.add(r));
    });
    return rows;
  }, [events]);
  const flashTargets = useMemo(() => {
    const set = new Set<string>();
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

  // Dynamic sizing
  const cols = grid[0]?.length || GRID_COLS;
  const rows = grid.length || GRID_ROWS;
  const boardPadding = 2; // reduced padding to allow larger cells
  const cellGap = 2; // reduced gap to allow larger cells
  const availableWidth = Math.max(
    0,
    container.width - insets.left - insets.right - boardPadding * 2
  );
  const availableHeight = Math.max(
    0,
    container.height - insets.top - insets.bottom - boardPadding * 2
  );
  const cellSizeW = (availableWidth - (cols - 1) * cellGap) / cols;
  const cellSizeH = (availableHeight - (rows - 1) * cellGap) / rows;
  const cellSize = Math.max(16, Math.floor(Math.min(cellSizeW, cellSizeH || 0)));
  const boardPixelWidth = cols * cellSize + (cols - 1) * cellGap + boardPadding * 2;
  const boardPixelHeight = rows * cellSize + (rows - 1) * cellGap + boardPadding * 2;
  const scale =
    container.width && container.height
      ? Math.min(container.width / boardPixelWidth, container.height / boardPixelHeight, 1)
      : 1;

  return (
    <Box onLayout={onLayout} alignItems="center" justifyContent="center" flex={1} p="$3">
      <Box style={{ transform: [{ scale }] }}>
        <Animated.View
          style={[
            {
              width: boardPixelWidth,
              height: boardPixelHeight,
              padding: boardPadding,
              backgroundColor: '#222',
            },
            boardStyle,
          ]}
        >
          {grid.map((row, y) => (
            <Box key={y} style={{ flexDirection: 'row' }}>
              {row.map((cell, x) => {
                const ghostCell = isGhost(x, y) && !cell;
                const trailCell = isTrail(x, y) && !cell;
                const keyStr = `${x},${y}`;
                const isClearing = clearingPositions.has(keyStr);
                const shake = bombRows.has(y);
                const fallAnim = isFalling(x, y);
                const flash = flashTargets.has(keyStr);
                const baseType = cell?.type || null;
                const cracked = (cell as any)?.cracked === true;
                const renderType = flash ? flashTypeMap.get(keyStr) ?? baseType : baseType;
                // For ghost/trail, show empty or faint overlay; if flashing, force render
                const displayType = flash ? renderType : ghostCell || trailCell ? null : renderType;

                return (
                  <Box
                    key={x}
                    style={{
                      marginRight: x < cols - 1 ? cellGap : 0,
                      marginBottom: y < rows - 1 ? cellGap : 0,
                      opacity: flash ? 1 : ghostCell ? 0.3 : trailCell ? 0.15 : 1,
                    }}
                  >
                    <FallingWrapper active={fallAnim} cellSize={cellSize}>
                      <Cell
                        blockType={displayType}
                        w={cellSize}
                        h={cellSize}
                        isClearing={isClearing}
                        shake={shake}
                        flash={flash}
                        bobFrame={fallAnim ? globalBobFrame : 0}
                        cracked={cracked}
                      />
                    </FallingWrapper>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Animated.View>
      </Box>
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
