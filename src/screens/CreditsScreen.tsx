import React, { useEffect } from 'react';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  VStack,
  HStack,
  Image as GSImage,
  Text,
  ScrollView,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { audioEngine } from '@/utils/audioEngine';
import { DepthFog } from '@/components/DepthFog';
import { LightRays } from '@/components/LightRays';
import { GridBackground } from '@/components/GridBackground';
import { ImageBackground, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

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

const AnimatedCredits: React.FC = () => {
  const scrollY = useSharedValue(0);

  useEffect(() => {
    // Start the auto-scroll animation - play only once
    scrollY.value = withTiming(1, { duration: 45000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 1],
      [800, -1000], // Start completely off-screen (800px down), scroll up to -1000px
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 0.1, 0.9, 1],
      [0, 1, 1, 0], // Fade in at start, fade out at end
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[{ flex: 1, justifyContent: 'center' }, animatedStyle]}>
      <VStack space="xl" alignItems="center" py="$8">
        {/* Game Title */}
        <VStack space="md" alignItems="center">
          <Heading
            size="3xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
              textAlign: 'center',
            }}
          >
            Slime Stacker
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 18,
            }}
          >
            A Puzzle Game
          </Text>
        </VStack>

        {/* Development */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Development
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Created with React Native
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Powered by Expo
          </Text>
        </VStack>

        {/* Assets */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Assets
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            UI Pack by Kenney
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Kenney Future Font
          </Text>
        </VStack>

        {/* Technology */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Technology
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            React Native Reanimated
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Shopify React Native Skia
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Gluestack UI
          </Text>
        </VStack>

        {/* Special Thanks */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Special Thanks
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            To all the open source
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            contributors and developers
          </Text>
        </VStack>

        {/* Lorem Ipsum Section 1 */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Development Team
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Sed do eiusmod tempor incididunt ut labore et dolore magna
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Ut enim ad minim veniam, quis nostrud exercitation
          </Text>
        </VStack>

        {/* Lorem Ipsum Section 2 */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Art & Design
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Duis aute irure dolor in reprehenderit in voluptate
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Velit esse cillum dolore eu fugiat nulla pariatur
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Excepteur sint occaecat cupidatat non proident
          </Text>
        </VStack>

        {/* Lorem Ipsum Section 3 */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Quality Assurance
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Sunt in culpa qui officia deserunt mollit anim
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Id est laborum et dolorum fuga et harum quidem
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Rerum facilis est et expedita distinctio nam libero
          </Text>
        </VStack>

        {/* Lorem Ipsum Section 4 */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Marketing & PR
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Tempore cum soluta nobis est eligendi optio
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Cumque nihil impedit quo minus id quod maxime
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Placeat facere possimus omnis voluptas assumenda
          </Text>
        </VStack>

        {/* Lorem Ipsum Section 5 */}
        <VStack space="sm" alignItems="center">
          <Heading
            size="xl"
            style={{
              fontFamily: 'Kenney-Future',
              color: '#2D2D2D',
            }}
          >
            Community Support
          </Heading>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Est et expedita distinctio nam libero tempore
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Cum soluta nobis est eligendi optio cumque
          </Text>
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#666666',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Nihil impedit quo minus id quod maxime placeat
          </Text>
        </VStack>
      </VStack>
    </Animated.View>
  );
};

export const CreditsScreen: React.FC<any> = ({ navigation }) => {
  const [showThankYou, setShowThankYou] = React.useState(false);
  const thankYouOpacity = useSharedValue(0);

  useEffect(() => {
    // Set a timeout to show "Thank you" after animation completes
    const timer = setTimeout(() => {
      console.log('Credits animation completed, showing thank you message');
      setShowThankYou(true);
      // Fade in the thank you message
      thankYouOpacity.value = withTiming(1, { duration: 1000 });
    }, 45000);

    return () => clearTimeout(timer);
  }, []);

  const thankYouAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: thankYouOpacity.value,
    };
  });

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
            {/* Animated Credits Content */}
            <Box flex={1} style={{ overflow: 'hidden' }}>
              <AnimatedCredits />
            </Box>

            {/* Green Jelly GIF */}
            <Box alignItems="center" mt="$4">
              <Image
                source={require('../../assets/sprites/gifs/jelly-idle.gif')}
                style={{
                  width: 80,
                  height: 80,
                }}
                resizeMode="contain"
              />
            </Box>

            {/* Back Button */}
            <Box alignSelf="stretch" mt="$4" mb="$6">
              <SmallMenuButton icon="title" onPress={() => navigation.goBack()}>
                Back to Menu
              </SmallMenuButton>
            </Box>
          </VStack>
        </Box>
      </SafeAreaView>

      {/* Thank You Message - Overlay */}
      {showThankYou && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: '30%',
              left: 0,
              right: 0,
              height: '40%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
              zIndex: 1000,
            },
            thankYouAnimatedStyle,
          ]}
        >
          <Text
            style={{
              fontFamily: 'Kenney-Future-Narrow',
              color: '#2D2D2D',
              textAlign: 'center',
              fontSize: 28,
              fontWeight: 'bold',
              padding: 20,
            }}
          >
            Thank you for playing!
          </Text>
        </Animated.View>
      )}
    </View>
  );
};
