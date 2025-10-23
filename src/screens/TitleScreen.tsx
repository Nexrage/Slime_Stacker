import React, { useEffect, useState } from 'react';
import {
  Center,
  Heading,
  Button,
  ButtonText,
  HStack,
  VStack,
  Image as GSImage,
  Text,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBackground, View } from 'react-native';
import { audioEngine } from '@/utils/audioEngine';
import { TileConfetti } from '@/components/TileConfetti';
import { TileConfettiCannons } from '@/components/TileConfettiCannons';
import { LargeFallingImages } from '@/components/LargeFallingImages';
import { AtmosphericParticles } from '@/components/AtmosphericParticles';
import { DepthFog } from '@/components/DepthFog';
import { LightRays } from '@/components/LightRays';
import { GridBackground } from '@/components/GridBackground';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDecay,
  withSequence,
  withDelay,
  withClamp,
} from 'react-native-reanimated';

export const TitleScreen: React.FC<any> = ({ navigation }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiReady, setConfettiReady] = useState(false);

  // Entrance animations
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  // Button exciting animations
  const buttonExcitingScale = useSharedValue(1);
  const buttonRotate = useSharedValue(0);
  const buttonBounce = useSharedValue(0);
  const buttonPulse = useSharedValue(1);

  // Entrance animations
  useEffect(() => {
    // Title spring entrance with reduced springing
    titleScale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 150 }));
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));

    // Button spring entrance with reduced springing
    buttonScale.value = withDelay(1000, withSpring(1, { damping: 10, stiffness: 180 }));
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 300 }));

    // Start background music
    console.log('🏠 TitleScreen: Starting background music...');
    audioEngine.playBackgroundMusic();

    // Log audio status after a short delay to ensure music has started
    setTimeout(() => {
      audioEngine.logAudioStatus();
    }, 2000);
  }, []);

  useEffect(() => {
    // Button scale sequence with cooldown
    const startButtonScale = () => {
      buttonExcitingScale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 100 }),
        withSpring(0.95, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 }),
        withTiming(1, { duration: 8000 }) // 8 second cooldown
      );
    };

    // Button rotation with cooldown
    const startButtonRotate = () => {
      buttonRotate.value = withSequence(
        withTiming(5, { duration: 1000 }),
        withDecay({ velocity: 0.1, clamp: [0, 10] }),
        withTiming(-5, { duration: 1000 }),
        withDecay({ velocity: -0.1, clamp: [-10, 0] }),
        withTiming(0, { duration: 6000 }) // 6 second cooldown
      );
    };

    // Button bounce with cooldown
    const startButtonBounce = () => {
      buttonBounce.value = withSequence(
        withSpring(8, { damping: 6, stiffness: 150 }),
        withSpring(0, { damping: 6, stiffness: 150 }),
        withTiming(0, { duration: 10000 }) // 10 second cooldown
      );
    };

    // Button pulse with cooldown
    const startButtonPulse = () => {
      buttonPulse.value = withSequence(
        withTiming(1.05, { duration: 800 }),
        withTiming(1, { duration: 800 }),
        withTiming(1, { duration: 5000 }) // 5 second cooldown
      );
    };

    // Start initial animations
    startButtonScale();
    startButtonRotate();
    startButtonBounce();
    startButtonPulse();

    // Set up recurring animations with different intervals
    const scaleInterval = setInterval(startButtonScale, 12000); // Every 12 seconds
    const rotateInterval = setInterval(startButtonRotate, 15000); // Every 15 seconds
    const bounceInterval = setInterval(startButtonBounce, 18000); // Every 18 seconds
    const pulseInterval = setInterval(startButtonPulse, 8000); // Every 8 seconds

    return () => {
      clearInterval(scaleInterval);
      clearInterval(rotateInterval);
      clearInterval(bounceInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  // Trigger large falling images right before continuous confetti
  const [showLargeFalling, setShowLargeFalling] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowLargeFalling(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Delay the start of the continuous TileConfetti until large images complete
  useEffect(() => {
    if (!showLargeFalling) {
      const t = setTimeout(() => setConfettiReady(true), 300);
      return () => clearTimeout(t);
    }
  }, [showLargeFalling]);

  // Periodic random falling images - continuous loop
  const [showRandomFalling, setShowRandomFalling] = useState(false);
  useEffect(() => {
    // Start the first random falling after 5 seconds
    const initialTimer = setTimeout(() => {
      setShowRandomFalling(true);
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonScale.value * buttonExcitingScale.value * buttonPulse.value },
      { rotate: `${buttonRotate.value}deg` },
      { translateY: buttonBounce.value },
    ],
    opacity: buttonOpacity.value,
  }));

  // Individual letter exciting animations
  const AnimatedLetter: React.FC<{ letter: string; delay: number }> = ({ letter, delay }) => {
    const letterBounce = useSharedValue(0);
    const letterRotate = useSharedValue(0);
    const letterScale = useSharedValue(1);
    const letterWiggle = useSharedValue(0);
    const letterGlow = useSharedValue(0);

    useEffect(() => {
      // Letter bounce with spring
      letterBounce.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withSpring(10, { damping: 6, stiffness: 160 }),
            withSpring(0, { damping: 6, stiffness: 160 })
          ),
          -1,
          false
        )
      );

      // Letter rotation with decay and clamp
      letterRotate.value = withDelay(
        delay + 500,
        withRepeat(
          withSequence(
            withTiming(10, { duration: 1200 }),
            withDecay({ velocity: 0.15, clamp: [0, 14] }),
            withTiming(-10, { duration: 1200 }),
            withDecay({ velocity: -0.15, clamp: [-14, 0] })
          ),
          -1,
          false
        )
      );

      // Letter scale with spring sequence
      letterScale.value = withDelay(
        delay + 1000,
        withRepeat(
          withSequence(
            withSpring(1.2, { damping: 8, stiffness: 140 }),
            withSpring(0.9, { damping: 8, stiffness: 140 }),
            withSpring(1.05, { damping: 8, stiffness: 140 }),
            withSpring(1, { damping: 8, stiffness: 140 })
          ),
          -1,
          false
        )
      );

      // Letter wiggle with timing
      letterWiggle.value = withDelay(
        delay + 1500,
        withRepeat(
          withSequence(
            withTiming(2, { duration: 300 }),
            withTiming(-2, { duration: 300 }),
            withTiming(1.5, { duration: 300 }),
            withTiming(-1.5, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        )
      );

      // Letter glow effect
      letterGlow.value = withDelay(
        delay + 2000,
        withRepeat(
          withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1400 })),
          -1,
          false
        )
      );
    }, [delay]);

    const letterAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: letterBounce.value },
        { translateX: letterWiggle.value },
        { rotate: `${letterRotate.value}deg` },
        { scale: letterScale.value },
      ],
      opacity: 0.8 + letterGlow.value * 0.2,
      shadowColor: letterGlow.value > 0.5 ? '#FFFFFF' : 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: letterGlow.value,
      shadowRadius: letterGlow.value * 10,
    }));

    return (
      <Animated.Text style={[{ fontFamily: 'Kenney-Future', fontSize: 36 }, letterAnimatedStyle]}>
        {letter}
      </Animated.Text>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FF' }}>
      {/* Ambient effects outside safe area, full screen */}
      <DepthFog visible intensity={0.1} color="#2D1B3D" />
      {/* Grid background layered over depth fog */}
      <GridBackground spacing={64} thickness={6} color="#F8F9FF" />
      <LightRays visible rayCount={3} intensity={1} color="#F8F9FF" />
      {/* <AtmosphericParticles
        visible
        particleCount={120}
        intensity={0.85}
        colors={['#A0E7E5', '#B4F8C8', '#FBE7C6', '#FFAEBC', '#FFFFFF']}
      /> */}
      <TileConfetti
        visible={showConfetti && confettiReady}
        onAnimationEnd={() => {
          setTimeout(() => setShowConfetti(true), 1000);
        }}
      />

      {/* One-shot image cannons behind the UI */}
      <TileConfettiCannons visible={true} />

      {/* Large falling images before continuous confetti */}
      <LargeFallingImages
        visible={showLargeFalling}
        onComplete={() => setShowLargeFalling(false)}
      />

      {/* Periodic random falling images */}
      <LargeFallingImages
        visible={showRandomFalling}
        onComplete={() => {
          // Animation completed, restart after a short delay
          setTimeout(() => {
            setShowRandomFalling(false);
            // Trigger a new falling sequence after a brief pause
            setTimeout(() => {
              setShowRandomFalling(true);
            }, 100);
          }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
        }}
        maxImages={3}
        includeRedJelly
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
        <Center flex={1} px="$8" pt="$8">
          {/* Skia ambient background layers (behind UI, inside safe area if needed) */}
          {/* <AtmosphericParticles visible particleCount={120} intensity={0.85} /> */}
          <Center>
            <Animated.View style={titleAnimatedStyle}>
              <VStack alignItems="center" space="sm" mb="$12">
                <HStack alignItems="center" space="sm">
                  {['S', 'l', 'i', 'm', 'e'].map((letter, index) => (
                    <AnimatedLetter key={`slime-${index}`} letter={letter} delay={index * 200} />
                  ))}
                </HStack>
                <HStack alignItems="center" space="sm">
                  {['S', 't', 'a', 'c', 'k', 'e', 'r'].map((letter, index) => (
                    <AnimatedLetter
                      key={`stacker-${index}`}
                      letter={letter}
                      delay={(index + 4) * 200}
                    />
                  ))}
                </HStack>
              </VStack>
            </Animated.View>
            <Animated.View style={buttonAnimatedStyle}>
              <ImageBackground
                resizeMode="stretch"
                source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Button
                  onPress={() => {
                    console.log('🎵 Title screen button pressed');
                    audioEngine.playClick();
                    navigation.replace('MainMenu');
                  }}
                  variant="link"
                  size="xl"
                  style={{
                    backgroundColor: 'transparent',
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    minHeight: 56,
                  }}
                >
                  <HStack alignItems="center" space="md">
                    <GSImage
                      alt="play"
                      source={require('../../assets/kenney_ui-pack/PNG/Extra/Default/icon_play_light.png')}
                      style={{ width: 28, height: 28 }}
                    />
                    <ButtonText
                      style={{
                        fontFamily: 'Kenney-Future-Narrow',
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#2D2D2D',
                      }}
                    >
                      Start Game
                    </ButtonText>
                  </HStack>
                </Button>
              </ImageBackground>
            </Animated.View>
          </Center>
        </Center>
      </SafeAreaView>
    </View>
  );
};
