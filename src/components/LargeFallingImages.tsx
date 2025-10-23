import React, { useEffect, useState } from 'react';
import { View, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LargeFallingImagesProps {
  visible: boolean;
  onComplete?: () => void;
}

interface FallingImage {
  id: string;
  image: any;
  startX: number;
  startY: number;
  endY: number;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
}

export const LargeFallingImages: React.FC<LargeFallingImagesProps> = ({ visible, onComplete }) => {
  const [images, setImages] = useState<FallingImage[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const imageData = [
      { image: require('../../assets/sprites/confetti_images/green.png'), color: 'green' },
      { image: require('../../assets/sprites/confetti_images/blue.png'), color: 'blue' },
      { image: require('../../assets/sprites/confetti_images/yellow.png'), color: 'yellow' },
      { image: require('../../assets/sprites/confetti_images/red.png'), color: 'red' },
    ];

    const fallingImages: FallingImage[] = imageData.flatMap((img, imgIndex) => {
      const instances = 4; // 4 instances per color
      const totalColumns = instances * imageData.length; // distribute across all images
      const margin = SCREEN_WIDTH * 0.02; // smaller side margins for more spread
      const usableWidth = SCREEN_WIDTH - margin * 2;

      return Array.from({ length: instances }, (_, instanceIndex) => {
        const globalIndex = imgIndex * instances + instanceIndex; // 0..totalColumns-1
        const baseT = totalColumns > 1 ? globalIndex / (totalColumns - 1) : 0.5; // 0..1
        const tVar = (Math.random() - 0.5) * 0.4; // spacing variance
        const t = Math.min(1, Math.max(0, baseT + tVar));
        const jitter = (Math.random() - 0.5) * 80; // larger horizontal jitter
        const leftBias = -SCREEN_WIDTH * 0.3; // shift distribution ~6% to the left

        // Staggered start times with extra random offset so starts are more varied
        const baseDelay = imgIndex * 220 + instanceIndex * 200;
        const randomDelay = Math.floor(Math.random() * 800); // 0-800ms
        const delay = baseDelay + randomDelay;

        return {
          id: `${img.color}-${instanceIndex}`,
          image: img.image,
          startX: Math.max(-50, margin + t * usableWidth + jitter + leftBias), // biased left
          startY: -220 - Math.random() * 120, // Start further above the screen
          endY: SCREEN_HEIGHT + 180, // End below screen
          size: 140 + Math.random() * 100, // Larger: 140-240 px
          rotation: Math.random() * 360, // Random initial rotation
          delay, // Staggered timing with variance
          duration: 3800 + Math.random() * 2200, // 3.8 - 6.0 seconds
        } as FallingImage;
      });
    });

    setImages(fallingImages);
  }, [visible]);

  // When all images finish, unmount and notify parent
  useEffect(() => {
    if (visible && images.length > 0 && completedCount >= images.length) {
      setEnded(true);
      onComplete?.();
    }
  }, [completedCount, images.length, visible, onComplete]);

  const handleImageComplete = () => {
    setCompletedCount(prev => prev + 1);
  };

  if (!visible || images.length === 0 || ended) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      {images.map(img => (
        <FallingImageComponent key={img.id} image={img} onComplete={handleImageComplete} />
      ))}
    </View>
  );
};

interface FallingImageComponentProps {
  image: FallingImage;
  onComplete: () => void;
}

const FallingImageComponent: React.FC<FallingImageComponentProps> = ({ image, onComplete }) => {
  const translateY = useSharedValue(image.startY);
  const rotate = useSharedValue(image.rotation);

  useEffect(() => {
    // Start falling animation after delay
    const startTimer = setTimeout(() => {
      translateY.value = withTiming(image.endY, { duration: image.duration }, finished => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });

      // Add rotation during fall
      rotate.value = withTiming(image.rotation + 360, { duration: image.duration });
    }, image.delay);

    return () => clearTimeout(startTimer);
  }, [image, translateY, rotate, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: image.startX },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: image.size,
          height: image.size,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={image.image}
        style={{
          width: '100%',
          height: '100%',
          resizeMode: 'contain',
        }}
      />
    </Animated.View>
  );
};
