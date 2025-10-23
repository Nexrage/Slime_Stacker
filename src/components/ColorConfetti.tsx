import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { ContinuousConfetti, ConfettiMethods } from 'react-native-fast-confetti';
import { useImage } from '@shopify/react-native-skia';

interface ColorConfettiProps {
  visible: boolean;
  onAnimationEnd?: () => void;
  image: any; // Static require() result
  count?: number;
  fallDuration?: number;
  randomSpeed?: { min: number; max: number };
}

export const ColorConfetti: React.FC<ColorConfettiProps> = ({
  visible,
  onAnimationEnd,
  image,
  count = 10,
  fallDuration = 12000,
  randomSpeed = { min: 0.4, max: 0.8 },
}) => {
  const confettiRef = useRef<ConfettiMethods>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
  ];

  const skImage = useImage(image);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        if (width && height) setSize({ width, height });
      }}
    >
      {size && skImage && (
        <ContinuousConfetti
          ref={confettiRef}
          count={count}
          flakeSize={{ width: 32, height: 32 }}
          width={size.width}
          height={size.height}
          fallDuration={fallDuration}
          blastDuration={4000}
          onAnimationStart={() => console.log('🎉 Confetti animation started (continuous)')}
          colors={colors}
          autoStartDelay={0}
          verticalSpacing={300}
          fadeOutOnEnd={false}
          onAnimationEnd={() => {
            console.log('🎉 Confetti image ended');
            onAnimationEnd?.();
          }}
          sizeVariation={0.3}
          rotation={{ x: { min: 2, max: 8 }, z: { min: 2, max: 8 } }}
          randomSpeed={randomSpeed}
          randomOffset={{ x: { min: -40, max: 40 }, y: { min: 0, max: 120 } }}
          type="image"
          flakeImage={skImage}
          containerStyle={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
    </View>
  );
};
