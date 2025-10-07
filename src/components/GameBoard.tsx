import React, { useMemo, useEffect } from 'react';
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

const imageForBlockType = (type: BlockType) => {
  switch (type) {
    case BlockType.RICK:
      return require('../../assets/sprites/hamster.png');
    case BlockType.COO:
      return require('../../assets/sprites/bird.png');
    case BlockType.KINE:
      return require('../../assets/sprites/fish.png');
    case BlockType.STAR:
      return require('../../assets/sprites/star.png');
    case BlockType.BRICK:
      return require('../../assets/sprites/block.png');
    case BlockType.BOMB:
      return require('../../assets/sprites/block.png'); // Using block.png as placeholder for bomb
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
}> = ({ blockType, w, h, isClearing, shake }) => {
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
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

  const imageSource = blockType ? imageForBlockType(blockType) : null;

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
  const boardTx = useSharedValue(0);
  const boardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: boardTx.value }] }));
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

  // Dynamic sizing
  const cols = grid[0]?.length || GRID_COLS;
  const rows = grid.length || GRID_ROWS;
  const boardPadding = 6;
  const cellGap = 4;
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
  const cellSize = Math.max(8, Math.floor(Math.min(cellSizeW, cellSizeH || 0)));
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
                const blockType = cell?.type || null;
                const isClearing = clearingPositions.has(`${x},${y}`);
                const shake = bombRows.has(y);
                const fallAnim = isFalling(x, y);

                // For ghost/trail, show empty or faint overlay; otherwise show the block image
                const displayType = ghostCell || trailCell ? null : blockType;

                return (
                  <Box
                    key={x}
                    style={{
                      marginRight: x < cols - 1 ? cellGap : 0,
                      marginBottom: y < rows - 1 ? cellGap : 0,
                      opacity: ghostCell ? 0.3 : trailCell ? 0.15 : 1,
                    }}
                  >
                    <FallingWrapper active={fallAnim} cellSize={cellSize}>
                      <Cell
                        blockType={displayType}
                        w={cellSize}
                        h={cellSize}
                        isClearing={isClearing}
                        shake={shake}
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
    const ty = useSharedValue(0);
    const style = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
    useEffect(() => {
      if (active) {
        ty.value = 0;
        ty.value = withTiming(0, { duration: 0 });
        ty.value = withTiming(cellSize, { duration: 450 }, () => {
          ty.value = withTiming(0, { duration: 0 });
        });
      } else {
        ty.value = withTiming(0, { duration: 120 });
      }
    }, [active, cellSize]);
    return <Animated.View style={style}>{children}</Animated.View>;
  });
