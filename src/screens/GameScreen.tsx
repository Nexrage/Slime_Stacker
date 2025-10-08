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
  VStack,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
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
import * as Haptics from 'expo-haptics';

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
    isResolving,
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

  const blocked = gameOver || !active || isResolving;

  const pan = Gesture.Pan()
    .minDistance(12)
    .onEnd(e => {
      if (blocked) return;
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
    if (blocked) return;
    runOnJS(rotate)();
  });

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      if (blocked) return;
      if (canHold) runOnJS(holdAction)();
    });

  const composed = Gesture.Race(longPress, tap, pan);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'left', 'bottom']}>
      <Box
        flex={1}
        accessibilityLabel="Game Screen"
        style={{ borderColor: '#00ffff', borderWidth: 1 }}
      >
        <Box style={{ borderColor: '#44aaee', borderWidth: 1 }}>
          <HStack justifyContent="space-between" alignItems="center" p="$2">
            <Box flex={1}>
              <GameUI
                mode={params.mode}
                difficulty={params.difficulty}
                score={score}
                chains={chains}
                next={next}
                hold={hold}
                canHold={canHold}
              />
            </Box>
            <HStack alignItems="center" space="md">
              {timerText ? (
                <Heading
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  {timerText}
                </Heading>
              ) : null}
              <Button
                size="sm"
                onPress={() => {
                  if (settings?.haptics !== false) Haptics.selectionAsync();
                  setActive(false);
                }}
                accessibilityLabel="Pause Game"
                variant="outline"
              >
                <ButtonText>⏸</ButtonText>
              </Button>
            </HStack>
          </HStack>
        </Box>
        <GestureDetector gesture={composed}>
          <Box flex={1} alignItems="center" justifyContent="center">
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
        {null}
        {/* Overlays */}
        {gameOver && (
          <Center
            pointerEvents="auto"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              borderColor: '#ff0000',
              borderWidth: 1,
            }}
            accessibilityLabel="Game Over Overlay"
          >
            <Heading style={{ marginBottom: 12 }}>Game Over</Heading>
            <Text style={{ marginBottom: 12 }}>Score: {score}</Text>
            <HStack style={{ marginBottom: 12 }}>
              <Text style={{ marginRight: 12 }}>Same Seed (dev)</Text>
              <Button
                onPress={() => {
                  if (settings?.haptics !== false) Haptics.selectionAsync();
                  navigation.setParams({ sameSeed: !params?.sameSeed });
                }}
                accessibilityLabel="Toggle Same Seed"
              >
                <ButtonText>{params?.sameSeed ? 'On' : 'Off'}</ButtonText>
              </Button>
            </HStack>
            <HStack>
              <Button
                onPress={() => {
                  if (settings?.haptics !== false)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  restart();
                }}
                accessibilityLabel="Restart Game"
                style={{ marginRight: 12 }}
              >
                <ButtonText>Restart</ButtonText>
              </Button>
              <Button
                onPress={() => {
                  if (settings?.haptics !== false) Haptics.selectionAsync();
                  navigation.popToTop();
                }}
                accessibilityLabel="Exit to Menu"
              >
                <ButtonText>Exit</ButtonText>
              </Button>
            </HStack>
          </Center>
        )}
        {!gameOver && !active && (
          <Center
            pointerEvents="auto"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              borderColor: '#ffa500',
              borderWidth: 1,
            }}
            accessibilityLabel="Paused Overlay"
          >
            <Heading style={{ marginBottom: 12 }}>Paused</Heading>
            <HStack>
              <Button
                onPress={() => {
                  if (settings?.haptics !== false) Haptics.selectionAsync();
                  setActive(true);
                }}
                accessibilityLabel="Resume Game"
                style={{ marginRight: 12 }}
              >
                <ButtonText>Resume</ButtonText>
              </Button>
              <Button
                onPress={() => {
                  if (settings?.haptics !== false) Haptics.selectionAsync();
                  navigation.popToTop();
                }}
                accessibilityLabel="Exit to Menu"
              >
                <ButtonText>Exit</ButtonText>
              </Button>
            </HStack>
          </Center>
        )}

        {/* Footer HUD always rendered so layout doesn't change */}
        <Box p="$3" style={{ borderColor: '#ee8844', borderWidth: 1 }}>
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center">
              <Avatar size="lg">
                <AvatarImage source={require('../../assets/icon.png')} alt="Player Avatar" />
                <AvatarFallbackText>Player</AvatarFallbackText>
              </Avatar>
              <VStack style={{ marginLeft: 12 }}>
                <Text>Player One</Text>
                <Text>
                  {params.mode ? `${params.mode}` : 'Mode'}{' '}
                  {params.difficulty ? `• ${params.difficulty}` : ''}
                </Text>
              </VStack>
            </HStack>
            <VStack alignItems="flex-end">
              <Text>Score</Text>
              <Heading>{score}</Heading>
              {chains > 0 ? <Text>Chain x{chains}</Text> : null}
            </VStack>
          </HStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
};
