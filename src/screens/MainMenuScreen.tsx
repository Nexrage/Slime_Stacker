import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  VStack,
  HStack,
  Image as GSImage,
} from '@gluestack-ui/themed';
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
import { ImageBackground } from 'react-native';

const AnimatedButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  slideFrom: 'left' | 'right';
  delay: number;
  style: any;
  oscillationSpeed?: number;
  icon?: 'play' | 'star' | 'gear' | 'book' | 'title' | undefined;
}> = ({ onPress, children, slideFrom, delay, style, oscillationSpeed = 2000, icon }) => {
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
      <ImageBackground
        resizeMode="stretch"
        source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
        style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}
      >
        <Button
          onPress={onPress}
          size="xl"
          variant="link"
          style={[
            style,
            {
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              zIndex: 1,
              backgroundColor: 'transparent',
            },
          ]}
        >
          <HStack alignItems="center" space="md">
            {icon === 'play' ? (
              <GSImage
                alt="play"
                source={require('../../assets/kenney_ui-pack/PNG/Extra/Default/icon_play_light.png')}
                style={{ width: 28, height: 28 }}
              />
            ) : null}
            {icon === 'star' ? (
              <GSImage
                alt="star"
                source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/star.png')}
                style={{ width: 28, height: 28 }}
              />
            ) : null}
            {icon === 'gear' ? (
              <GSImage
                alt="settings"
                source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/icon_outline_circle.png')}
                style={{ width: 28, height: 28 }}
              />
            ) : null}
            {icon === 'book' ? (
              <GSImage
                alt="tutorial"
                source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/icon_square.png')}
                style={{ width: 28, height: 28 }}
              />
            ) : null}
            {icon === 'title' ? (
              <GSImage
                alt="back"
                source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/arrow_basic_w.png')}
                style={{ width: 28, height: 28 }}
              />
            ) : null}
            <ButtonText
              style={{ fontFamily: 'Kenney-Future-Narrow' }}
              fontSize="$2xl"
              fontWeight="bold"
            >
              {children}
            </ButtonText>
          </HStack>
        </Button>
      </ImageBackground>
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
        <VStack space="md" flex={1} justifyContent="center">
          <AnimatedButton
            onPress={() => navigation.navigate('LevelSelect')}
            slideFrom="left"
            delay={100}
            oscillationSpeed={1800}
            icon="play"
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '2deg' }],
              marginVertical: 2,
            }}
          >
            Round Clear
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Game', { mode: 'challenge' })}
            slideFrom="right"
            delay={200}
            oscillationSpeed={2400}
            icon="star"
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '-2deg' }],
              marginVertical: 2,
            }}
          >
            Challenge
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Game', { mode: 'timeAttack' })}
            slideFrom="left"
            delay={300}
            oscillationSpeed={1600}
            icon="play"
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '2deg' }],
              marginVertical: 2,
            }}
          >
            Time Attack
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Tutorial')}
            slideFrom="right"
            delay={400}
            oscillationSpeed={2200}
            icon="book"
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '-2deg' }],
              marginVertical: 2,
            }}
          >
            How to Play
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Settings')}
            slideFrom="left"
            delay={500}
            oscillationSpeed={2000}
            icon="gear"
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '2deg' }],
              marginVertical: 2,
            }}
          >
            Settings
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.navigate('Title')}
            slideFrom="right"
            delay={600}
            oscillationSpeed={2600}
            icon="title"
            style={{
              flex: 1,
              minHeight: 80,
              transform: [{ skewY: '-2deg' }],
              marginVertical: 2,
            }}
          >
            Back to Title Screen
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
