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
  maxImages?: number; // Limit the number of falling images
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

export const LargeFallingImages: React.FC<LargeFallingImagesProps> = ({
  visible,
  onComplete,
  maxImages,
}) => {
  const [images, setImages] = useState<FallingImage[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [ended, setEnded] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!visible) return;

    // Reset run state when (re)starting a visible sequence
    setEnded(false);
    setCompletedCount(0);
    setRunId(prev => prev + 1);

    // Use idle jelly GIFs for all falling images (random selection each instance)
    const imageData: Array<{ image: any; color: string }> = [
      { image: require('../../assets/sprites/gifs/blue-jelly-idle.gif'), color: 'blue-jelly' },
      { image: require('../../assets/sprites/gifs/red-jelly-idle.gif'), color: 'red-jelly' },
      { image: require('../../assets/sprites/gifs/yellow-jelly-idle.gif'), color: 'yellow-jelly' },
      { image: require('../../assets/sprites/gifs/jelly-idle.gif'), color: 'jelly' },
    ];

    const totalCount = Math.max(1, typeof maxImages === 'number' && maxImages > 0 ? maxImages : 8);

    const fallingImages: FallingImage[] = Array.from({ length: totalCount }, (_, instanceIndex) => {
      const choice = imageData[Math.floor(Math.random() * imageData.length)];

      // Distribute horizontally across screen with jitter
      const margin = SCREEN_WIDTH * 0.02;
      const usableWidth = SCREEN_WIDTH - margin * 2;
      const baseT = totalCount > 1 ? instanceIndex / (totalCount - 1) : 0.5;
      const tVar = (Math.random() - 0.5) * 0.4; // spacing variance
      const t = Math.min(1, Math.max(0, baseT + tVar));
      const jitter = (Math.random() - 0.5) * 80;
      const leftBias = -SCREEN_WIDTH * 0.3;

      // Staggered start times and varied durations
      const baseDelay = Math.floor(instanceIndex * 180);
      const randomDelay = Math.floor(Math.random() * 800);
      const delay = baseDelay + randomDelay;

      return {
        id: `${runId}-${choice.color}-${instanceIndex}`,
        image: choice.image,
        startX: Math.max(-50, margin + t * usableWidth + jitter + leftBias),
        startY: -220 - Math.random() * 120,
        endY: SCREEN_HEIGHT + 180,
        size: 96 + Math.random() * 64, // 96 - 160 px, better for GIF perf
        rotation: Math.random() * 360,
        delay,
        duration: 3800 + Math.random() * 2200, // 3.8 - 6.0 seconds
      } as FallingImage;
    });

    setImages(fallingImages);
  }, [visible, maxImages]);

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
      removeClippedSubviews
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
          // Rasterization hints for better GIF transform performance
          renderToHardwareTextureAndroid: true,
          shouldRasterizeIOS: true,
          needsOffscreenAlphaCompositing: true,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={image.image}
        fadeDuration={0}
        progressiveRenderingEnabled
        resizeMethod="resize"
        style={{
          width: '100%',
          height: '100%',
          resizeMode: 'contain',
        }}
      />
    </Animated.View>
  );
};
