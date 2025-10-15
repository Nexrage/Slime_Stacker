import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonText, Heading, VStack } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadSettings, updateSettings } from '@/utils/storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const AnimatedButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  slideFrom: 'left' | 'right';
  delay: number;
  style: any;
  oscillationSpeed?: number;
}> = ({ onPress, children, slideFrom, delay, style, oscillationSpeed = 2000 }) => {
  const translateX = useSharedValue(slideFrom === 'left' ? -300 : 300);
  const opacity = useSharedValue(0);
  const oscillateX = useSharedValue(0);
  const oscillateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + oscillateX.value },
      { translateY: oscillateY.value },
    ],
    opacity: opacity.value,
  }));

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));

    // Start continuous horizontal oscillation after slide-in animation completes
    oscillateX.value = withDelay(
      delay + 800, // Wait for slide-in to complete
      withRepeat(
        withTiming(3, { duration: oscillationSpeed }),
        -1, // infinite repeat
        true // reverse for continuous back-and-forth
      )
    );

    // Start continuous vertical oscillation with different timing
    oscillateY.value = withDelay(
      delay + 1000, // Slightly offset from horizontal
      withRepeat(
        withTiming(2, { duration: oscillationSpeed * 1.3 }), // Different speed for Y
        -1, // infinite repeat
        true // reverse for continuous back-and-forth
      )
    );
  }, []);

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      <Button
        onPress={onPress}
        size="xl"
        style={[
          style,
          {
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            zIndex: 1,
          },
        ]}
      >
        {children}
      </Button>
    </Animated.View>
  );
};

export const MainMenuScreen: React.FC<any> = ({ navigation }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    loadSettings().then(s => setShowOnboarding(!s.onboarded));
  }, []);
  const dismissOnboarding = async () => {
    await updateSettings({ onboarded: true });
    setShowOnboarding(false);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} justifyContent="center" px="$4">
        <VStack space="$2" flex={1} justifyContent="center">
          <AnimatedButton
            onPress={() => navigation.navigate('LevelSelect')}
            slideFrom="left"
            delay={100}
            oscillationSpeed={1800}
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '2deg' }],
              marginVertical: 2,
            }}
          >
            <ButtonText fontSize="$2xl" fontWeight="$bold">
              Round Clear
            </ButtonText>
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Game', { mode: 'challenge' })}
            slideFrom="right"
            delay={200}
            oscillationSpeed={2400}
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '-2deg' }],
              marginVertical: 2,
            }}
          >
            <ButtonText fontSize="$2xl" fontWeight="$bold">
              Challenge
            </ButtonText>
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Game', { mode: 'timeAttack' })}
            slideFrom="left"
            delay={300}
            oscillationSpeed={1600}
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '2deg' }],
              marginVertical: 2,
            }}
          >
            <ButtonText fontSize="$2xl" fontWeight="$bold">
              Time Attack
            </ButtonText>
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Tutorial')}
            slideFrom="right"
            delay={400}
            oscillationSpeed={2200}
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '-2deg' }],
              marginVertical: 2,
            }}
          >
            <ButtonText fontSize="$2xl" fontWeight="$bold">
              How to Play
            </ButtonText>
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Settings')}
            slideFrom="left"
            delay={500}
            oscillationSpeed={2000}
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '2deg' }],
              marginVertical: 2,
            }}
          >
            <ButtonText fontSize="$2xl" fontWeight="$bold">
              Settings
            </ButtonText>
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Title')}
            slideFrom="right"
            delay={600}
            oscillationSpeed={2600}
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '-2deg' }],
              marginVertical: 2,
            }}
          >
            <ButtonText fontSize="$2xl" fontWeight="$bold">
              Back to Title Screen
            </ButtonText>
          </AnimatedButton>
        </VStack>
        {showOnboarding ? (
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
            accessibilityLabel="Onboarding Overlay"
          >
            <Box style={{ margin: 24, padding: 16, backgroundColor: '#111', borderRadius: 8 }}>
              <Heading mb="$3">How to Play</Heading>
              <Button onPress={dismissOnboarding}>
                <ButtonText>Got it</ButtonText>
              </Button>
            </Box>
          </Box>
        ) : null}
      </Box>
    </SafeAreaView>
  );
};
