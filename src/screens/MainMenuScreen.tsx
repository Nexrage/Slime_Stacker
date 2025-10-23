import React, { useEffect } from 'react';
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
import { audioEngine } from '@/utils/audioEngine';
import { DepthFog } from '@/components/DepthFog';
import { LightRays } from '@/components/LightRays';
import { GridBackground } from '@/components/GridBackground';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { ImageBackground, View } from 'react-native';

const SmallMenuButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  icon?: 'play' | 'star' | 'gear' | 'book' | 'title' | undefined;
}> = ({ onPress, children, icon }) => {
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
      style={{ borderRadius: 8, overflow: 'hidden' }}
    >
      <Button
        onPress={() => {
          audioEngine.playClick();
          onPress();
        }}
        size="md"
        variant="link"
        style={{ backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 6 }}
      >
        <HStack alignItems="center" space="sm">
          {icon === 'book' ? (
            <GSImage
              alt="tutorial"
              source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/icon_square.png')}
              style={{ width: 20, height: 20 }}
            />
          ) : null}
          {icon === 'gear' ? (
            <GSImage
              alt="settings"
              source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/icon_outline_circle.png')}
              style={{ width: 20, height: 20 }}
            />
          ) : null}
          {icon === 'title' ? (
            <GSImage
              alt="back"
              source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/arrow_basic_w.png')}
              style={{ width: 20, height: 20 }}
            />
          ) : null}
          <ButtonText
            style={{ fontFamily: 'Kenney-Future-Narrow' }}
            fontSize="$lg"
            fontWeight="bold"
          >
            {children}
          </ButtonText>
        </HStack>
      </Button>
    </ImageBackground>
  );
};

const TinyMenuButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  icon?: 'play' | 'star' | 'gear' | 'book' | 'title' | undefined;
}> = ({ onPress, children, icon }) => {
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
      style={{ borderRadius: 8, overflow: 'hidden' }}
    >
      <Button
        onPress={() => {
          audioEngine.playClick();
          onPress();
        }}
        size="md"
        variant="link"
        style={{ backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 6 }}
      >
        <HStack alignItems="center" space="sm">
          {icon === 'book' ? (
            <GSImage
              alt="tutorial"
              source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/icon_square.png')}
              style={{ width: 20, height: 20 }}
            />
          ) : null}
          {icon === 'gear' ? (
            <GSImage
              alt="settings"
              source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/icon_outline_circle.png')}
              style={{ width: 20, height: 20 }}
            />
          ) : null}
          {icon === 'title' ? (
            <GSImage
              alt="back"
              source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/arrow_basic_w.png')}
              style={{ width: 20, height: 20 }}
            />
          ) : null}
          <ButtonText
            style={{ fontFamily: 'Kenney-Future-Narrow' }}
            fontSize="$lg"
            fontWeight="bold"
          >
            {children}
          </ButtonText>
        </HStack>
      </Button>
    </ImageBackground>
  );
};

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
        style={{
          flex: 1,
          borderRadius: 8,
          overflow: 'hidden',
          transform: style.transform || [],
        }}
      >
        <Button
          onPress={() => {
            audioEngine.playClick();
            onPress();
          }}
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
              style={{
                fontFamily: 'Kenney-Future-Narrow',
                flexShrink: 1,
                textAlign: 'center',
              }}
              fontSize="$xl"
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
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FF' }}>
      {/* Ambient effects outside safe area, full screen */}
      <DepthFog visible intensity={0.1} color="#2D1B3D" />
      {/* Grid background layered over depth fog */}
      <GridBackground spacing={64} thickness={6} color="#F8F9FF" />
      <LightRays visible rayCount={3} intensity={1} color="#F8F9FF" />

      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} px="$4">
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
            <Box flex={1} />
            <VStack space="sm" alignItems="stretch" mt="$4" mb="$6">
              <Box alignSelf="stretch">
                <SmallMenuButton icon="book" onPress={() => navigation.navigate('Tutorial')}>
                  How to Play
                </SmallMenuButton>
              </Box>
              <Box alignSelf="stretch">
                <SmallMenuButton icon="gear" onPress={() => navigation.navigate('Settings')}>
                  Settings
                </SmallMenuButton>
              </Box>
              <HStack space="sm" alignItems="stretch">
                <Box flex={1}>
                  <TinyMenuButton icon="book" onPress={() => navigation.navigate('Credits')}>
                    Credits
                  </TinyMenuButton>
                </Box>
                <Box flex={1}>
                  <TinyMenuButton icon="star" onPress={() => console.log('Share Game pressed')}>
                    Share Game
                  </TinyMenuButton>
                </Box>
              </HStack>
              <Box alignSelf="stretch">
                <SmallMenuButton icon="title" onPress={() => navigation.navigate('Title')}>
                  Back to Title
                </SmallMenuButton>
              </Box>
            </VStack>
          </VStack>
        </Box>
      </SafeAreaView>
    </View>
  );
};
