import React, { useMemo, useEffect } from 'react';
import { Box } from '@gluestack-ui/themed';
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

const colorFor = (cell: BlockCell) => {
  if (!cell) return '#111';
  switch (cell.type) {
    case BlockType.RICK:
      return '#d9534f';
    case BlockType.COO:
      return '#5bc0de';
    case BlockType.KINE:
      return '#f0ad4e';
    case BlockType.STAR:
      return '#ffd700';
    case BlockType.BOMB:
      return '#b74';
    case BlockType.BRICK:
      return '#777';
  }
};

const Cell: React.FC<{ bg: string; w: number; h: number; isClearing: boolean; shake: boolean }> = ({
  bg,
  w,
  h,
  isClearing,
  shake,
}) => {
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
  return (
    <Animated.View
      style={[
        { width: w, height: h, margin: 4, backgroundColor: bg, borderRadius: 4 },
        animatedStyle,
      ]}
    />
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

  return (
    <Box alignItems="center" justifyContent="center" flex={1} p="$3">
      <Animated.View
        style={[
          { width: 8 * 32 + 8, height: 12 * 32 + 8, padding: 4, backgroundColor: '#222' },
          boardStyle,
        ]}
      >
        {grid.map((row, y) => (
          <Box key={y} style={{ flexDirection: 'row' }}>
            {row.map((cell, x) => {
              const ghostCell = isGhost(x, y) && !cell;
              const trailCell = isTrail(x, y) && !cell;
              const bg = ghostCell
                ? 'rgba(255,255,255,0.15)'
                : trailCell
                ? 'rgba(255,255,255,0.08)'
                : colorFor(cell);
              const isClearing = clearingPositions.has(`${x},${y}`);
              const shake = bombRows.has(y);
              const fallAnim = isFalling(x, y);
              return (
                <FallingWrapper key={x} active={fallAnim}>
                  <Cell bg={bg} w={32} h={32} isClearing={isClearing} shake={shake} />
                </FallingWrapper>
              );
            })}
          </Box>
        ))}
      </Animated.View>
    </Box>
  );
};

const FallingWrapper: React.FC<{ active: boolean; children: React.ReactNode }> = React.memo(
  ({ active, children }) => {
    const ty = useSharedValue(0);
    const style = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
    useEffect(() => {
      if (active) {
        ty.value = 0;
        ty.value = withTiming(0, { duration: 0 });
        ty.value = withTiming(32, { duration: 450 }, () => {
          ty.value = withTiming(0, { duration: 0 });
        });
      } else {
        ty.value = withTiming(0, { duration: 120 });
      }
    }, [active]);
    return <Animated.View style={style}>{children}</Animated.View>;
  }
);
