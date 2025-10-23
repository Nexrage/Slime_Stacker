import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Center,
  Heading,
  Text,
  VStack,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  Image as GSImage,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { GameUI } from '@/components/GameUI';
import { GameBoard } from '@/components/GameBoard';
import { useGameLoop } from '@/hooks/useGameLoop';
import { submitHighscore, loadSettings, Settings } from '@/utils/storage';
import { audio } from '@/utils/audio';
import { audioEngine } from '@/utils/audioEngine';
import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImageBackground } from 'react-native';

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
    bonusStars,
    notifyClearingComplete,
    clearingToken,
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

  // Submit highscore when game ends
  useMemo(() => {
    if (gameOver && (params.mode === 'timeAttack' || params.mode === 'roundClear')) {
      submitHighscore({ mode: params.mode || 'unknown', score, timestamp: Date.now() });
    }
  }, [gameOver, params.mode, score]);

  // Load settings and setup audio
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

  // Pause on background/blur
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

  // Haptics helper
  const playHaptic = useCallback(
    (type: 'selection' | 'medium' = 'selection') => {
      if (settings?.haptics === false) return;
      if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.selectionAsync();
      }
    },
    [settings?.haptics]
  );

  const blocked = gameOver || !active;

  // Gesture handlers
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
      {/* Header */}
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
          {timerText && (
            <Heading
              size="lg"
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              {timerText}
            </Heading>
          )}
          <ImageBackground
            resizeMode="stretch"
            source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
            style={{ borderRadius: 6, overflow: 'hidden' }}
          >
            <Button
              size="sm"
              onPress={() => {
                audioEngine.playClick();
                playHaptic();
                setActive(false);
              }}
              variant="link"
              style={{ backgroundColor: 'transparent', paddingHorizontal: 8 }}
            >
              <HStack alignItems="center" space="xs">
                <GSImage
                  alt="pause"
                  source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/icon_square.png')}
                  style={{ width: 16, height: 16 }}
                />
                <ButtonText style={{ fontFamily: 'Kenney-Future-Narrow', fontSize: 14 }}>
                  Pause
                </ButtonText>
              </HStack>
            </Button>
          </ImageBackground>
        </HStack>
      </HStack>

      {/* Game Board - fills space between header and footer */}
      <GestureDetector gesture={composed}>
        <Box flex={1}>
          <GameBoard
            grid={grid}
            ghost={ghost}
            falling={fallingPositions}
            dropTrail={dropTrail}
            shakeBoard={shake}
            events={events}
            bonusStars={bonusStars}
            onClearingComplete={notifyClearingComplete}
            clearingToken={clearingToken}
          />
        </Box>
      </GestureDetector>

      {/* Footer */}
      <Box p="$3">
        <HStack alignItems="center" justifyContent="space-between">
          <HStack alignItems="center">
            <Avatar size="lg">
              <AvatarImage source={require('../../assets/icon.png')} alt="Player Avatar" />
              <AvatarFallbackText>Player</AvatarFallbackText>
            </Avatar>
            <VStack style={{ marginLeft: 12 }}>
              <Text>Player One</Text>
              <Text size="sm" color="$textLight400">
                {params.mode ? `${params.mode}` : 'Mode'}
                {params.difficulty ? ` • ${params.difficulty}` : ''}
              </Text>
            </VStack>
          </HStack>
          <VStack alignItems="flex-end">
            <Text size="sm" color="$textLight400">
              Score
            </Text>
            <Heading size="xl">{score}</Heading>
          </VStack>
        </HStack>
      </Box>

      {/* Game Over Overlay */}
      {gameOver && (
        <Center
          pointerEvents="auto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
          }}
        >
          <VStack space="lg" alignItems="center">
            <Heading size="2xl">Game Over</Heading>
            <Text size="xl">Score: {score}</Text>

            {/* Dev: Same Seed Toggle */}
            <HStack space="md" alignItems="center">
              <Text size="sm">Same Seed (dev)</Text>
              <Button
                size="sm"
                onPress={() => {
                  playHaptic();
                  navigation.setParams({ sameSeed: !params?.sameSeed });
                }}
                variant={params?.sameSeed ? 'solid' : 'outline'}
              >
                <ButtonText>{params?.sameSeed ? 'On' : 'Off'}</ButtonText>
              </Button>
            </HStack>

            <HStack space="md">
              <Button
                onPress={() => {
                  playHaptic('medium');
                  restart();
                }}
                size="lg"
              >
                <ButtonText>Restart</ButtonText>
              </Button>
              <Button
                onPress={() => {
                  playHaptic();
                  navigation.popToTop();
                }}
                variant="outline"
                size="lg"
              >
                <ButtonText>Exit</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Center>
      )}

      {/* Paused Overlay */}
      {!gameOver && !active && (
        <Center
          pointerEvents="auto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
          }}
        >
          <ImageBackground
            resizeMode="stretch"
            source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_border.png')}
            style={{ padding: 16, borderRadius: 12, overflow: 'hidden' }}
          >
            <VStack space="lg" alignItems="center">
              <Heading size="2xl" style={{ fontFamily: 'Kenney-Future' }}>
                Paused
              </Heading>
              <HStack space="md" alignItems="center">
                <ImageBackground
                  resizeMode="stretch"
                  source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
                  style={{ borderRadius: 8, overflow: 'hidden' }}
                >
                  <Button
                    onPress={() => {
                      audioEngine.playClick();
                      playHaptic();
                      setActive(true);
                    }}
                    size="lg"
                    variant="link"
                    style={{ backgroundColor: 'transparent', paddingHorizontal: 16 }}
                  >
                    <HStack alignItems="center" space="sm">
                      <GSImage
                        alt="resume"
                        source={require('../../assets/kenney_ui-pack/PNG/Extra/Default/icon_play_light.png')}
                        style={{ width: 20, height: 20 }}
                      />
                      <ButtonText style={{ fontFamily: 'Kenney-Future-Narrow' }}>Resume</ButtonText>
                    </HStack>
                  </Button>
                </ImageBackground>
                <ImageBackground
                  resizeMode="stretch"
                  source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
                  style={{ borderRadius: 8, overflow: 'hidden' }}
                >
                  <Button
                    onPress={() => {
                      audioEngine.playClick();
                      playHaptic();
                      navigation.popToTop();
                    }}
                    variant="link"
                    size="lg"
                    style={{ backgroundColor: 'transparent', paddingHorizontal: 16 }}
                  >
                    <HStack alignItems="center" space="sm">
                      <GSImage
                        alt="exit"
                        source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/icon_cross.png')}
                        style={{ width: 20, height: 20 }}
                      />
                      <ButtonText style={{ fontFamily: 'Kenney-Future-Narrow' }}>Exit</ButtonText>
                    </HStack>
                  </Button>
                </ImageBackground>
              </HStack>
            </VStack>
          </ImageBackground>
        </Center>
      )}
    </SafeAreaView>
  );
};
