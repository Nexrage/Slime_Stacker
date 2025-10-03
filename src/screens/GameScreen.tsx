import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Center,
  Heading,
  Pressable,
  Text,
} from '@gluestack-ui/themed';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { GameUI } from '@/components/GameUI';
import { GameBoard } from '@/components/GameBoard';
import { useGameLoop } from '@/hooks/useGameLoop';
import { submitHighscore, loadSettings, Settings } from '@/utils/storage';
import { audio } from '@/utils/audio';
import { AppState } from 'react-native';

export const GameScreen: React.FC<any> = ({ navigation, route }) => {
  const params = route?.params || {};
  const [active, setActive] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const {
    grid,
    score,
    chains,
    ghost,
    fallingPositions,
    events,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotate,
    holdAction,
    restart,
    next,
    hold,
    canHold,
    timeLeft,
    gameOver,
    dropTrail,
    shake,
  } = useGameLoop(active, params.mode, {
    hapticsEnabled: settings?.haptics !== false,
    sameSeed: params?.sameSeed,
  });
  const timerText =
    typeof timeLeft === 'number'
      ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
      : undefined;

  useMemo(() => {
    if (gameOver && (params.mode === 'timeAttack' || params.mode === 'roundClear')) {
      submitHighscore({ mode: params.mode || 'unknown', score, timestamp: Date.now() });
    }
  }, [gameOver, params.mode, score]);

  useEffect(() => {
    loadSettings().then(s => {
      setSettings(s);
      audio.setSettings(s);
      if (s.music) {
        // Placeholder for BGM asset
        // audio.playBgmAsync(require('../../assets/bgm.mp3'))
      }
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') setActive(false);
    });
    const unsubscribe = navigation.addListener('blur', () => setActive(false));
    const subscribe = navigation.addListener('focus', () => setActive(true));
    return () => {
      sub.remove();
      unsubscribe();
      subscribe();
    };
  }, [navigation]);

  const pan = Gesture.Pan()
    .minDistance(12)
    .onEnd(e => {
      if (gameOver || !active) return;
      const dx = e.translationX;
      const dy = e.translationY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 16) runOnJS(moveRight)();
        else if (dx < -16) runOnJS(moveLeft)();
      } else {
        if (dy > 16) runOnJS(softDrop)();
        else if (dy < -16) runOnJS(hardDrop)();
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    if (gameOver || !active) return;
    runOnJS(rotate)();
  });

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      if (gameOver || !active) return;
      if (canHold) runOnJS(holdAction)();
    });

  const composed = Gesture.Race(longPress, tap, pan);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'left', 'bottom']}>
      <Box flex={1} accessibilityLabel="Game Screen">
        <GameUI
          mode={params.mode}
          difficulty={params.difficulty}
          score={score}
          chains={chains}
          next={next}
          hold={hold}
          canHold={canHold}
        />
        {timerText ? (
          <Center style={{ position: 'absolute', top: 8, right: 12 }} accessibilityLabel="Timer">
            <Heading
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              {timerText}
            </Heading>
          </Center>
        ) : null}
        <GestureDetector gesture={composed}>
          <Box flex={1}>
            <GameBoard
              grid={grid}
              ghost={ghost}
              falling={fallingPositions}
              dropTrail={dropTrail}
              shakeBoard={shake}
              events={events}
            />
          </Box>
        </GestureDetector>
        {chains > 0 ? (
          <Center style={{ position: 'absolute', top: 72, left: 0, right: 0 }}>
            <Heading
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              Chain x{chains}
            </Heading>
          </Center>
        ) : null}
        {gameOver ? (
          <Center
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }}
            accessibilityLabel="Game Over Overlay"
          >
            <Heading style={{ marginBottom: 12 }}>Game Over</Heading>
            <Text style={{ marginBottom: 12 }}>Score: {score}</Text>
            <HStack style={{ marginBottom: 12 }}>
              <Text style={{ marginRight: 12 }}>Same Seed (dev)</Text>
              <Button
                onPress={() => navigation.setParams({ sameSeed: !params?.sameSeed })}
                accessibilityLabel="Toggle Same Seed"
              >
                <ButtonText>{params?.sameSeed ? 'On' : 'Off'}</ButtonText>
              </Button>
            </HStack>
            <HStack>
              <Button
                onPress={restart}
                accessibilityLabel="Restart Game"
                style={{ marginRight: 12 }}
              >
                <ButtonText>Restart</ButtonText>
              </Button>
              <Button onPress={() => navigation.popToTop()} accessibilityLabel="Exit to Menu">
                <ButtonText>Exit</ButtonText>
              </Button>
            </HStack>
          </Center>
        ) : !active ? (
          <Center
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }}
            accessibilityLabel="Paused Overlay"
          >
            <Heading style={{ marginBottom: 12 }}>Paused</Heading>
            <HStack>
              <Button
                onPress={() => setActive(true)}
                accessibilityLabel="Resume Game"
                style={{ marginRight: 12 }}
              >
                <ButtonText>Resume</ButtonText>
              </Button>
              <Button onPress={() => navigation.popToTop()} accessibilityLabel="Exit to Menu">
                <ButtonText>Exit</ButtonText>
              </Button>
            </HStack>
          </Center>
        ) : (
          <HStack justifyContent="space-between" p="$3">
            <Button onPress={moveLeft} accessibilityLabel="Move Left">
              <ButtonText>Left</ButtonText>
            </Button>
            <Button onPress={rotate} accessibilityLabel="Rotate">
              <ButtonText>Rotate</ButtonText>
            </Button>
            <Button onPress={softDrop} accessibilityLabel="Soft Drop">
              <ButtonText>Down</ButtonText>
            </Button>
            <Button onPress={moveRight} accessibilityLabel="Move Right">
              <ButtonText>Right</ButtonText>
            </Button>
            <Button onPress={holdAction} accessibilityLabel="Hold Swap">
              <ButtonText>Hold</ButtonText>
            </Button>
            <Button onPress={() => setActive(a => !a)} accessibilityLabel="Pause or Resume">
              <ButtonText>{active ? 'Pause' : 'Resume'}</ButtonText>
            </Button>
            <Button onPress={() => navigation.popToTop()} accessibilityLabel="Exit to Menu">
              <ButtonText>Exit</ButtonText>
            </Button>
          </HStack>
        )}
      </Box>
    </SafeAreaView>
  );
};
