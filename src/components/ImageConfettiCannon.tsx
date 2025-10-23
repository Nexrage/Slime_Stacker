import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Confetti } from 'react-native-fast-confetti';
import { useImage } from '@shopify/react-native-skia';

interface ImageConfettiCannonProps {
  visible: boolean;
  image: any; // static require(...) result
  cannonsPositions: Array<{ x: number; y: number }>;
  count?: number;
  fallDuration?: number;
  blastDuration?: number;
  flakeSize?: { width: number; height: number };
  fallFlakeSize?: { width: number; height: number };
  sizeVariation?: number;
  randomSpeed?: { min: number; max: number };
  randomOffset?: { x: { min: number; max: number }; y: { min: number; max: number } };
  autoStartDelayMs?: number;
}

export const ImageConfettiCannon: React.FC<ImageConfettiCannonProps> = ({
  visible,
  image,
  cannonsPositions,
  count = 60,
  fallDuration = 3000,
  blastDuration = 450,
  flakeSize = { width: 24, height: 24 },
  fallFlakeSize = { width: 40, height: 40 },
  sizeVariation = 0.2,
  randomSpeed = { min: 0.8, max: 1.1 },
  randomOffset = { x: { min: -30, max: 30 }, y: { min: -60, max: 0 } },
  autoStartDelayMs = 300,
}) => {
  const skImage = useImage(image);
  const ref = useRef<any>(null);
  const [hasFired, setHasFired] = useState(false);
  const [ended, setEnded] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [currentFlakeSize, setCurrentFlakeSize] = useState<{ width: number; height: number }>(
    flakeSize
  );

  const pixelCannons = useMemo(() => {
    if (!size) return [] as Array<{ x: number; y: number }>;
    return cannonsPositions.map(p => ({
      x: p.x <= 1 ? p.x * size.width : p.x,
      y: p.y <= 1 ? p.y * size.height : p.y,
    }));
  }, [cannonsPositions, size]);

  useEffect(() => {
    if (!visible || !skImage || hasFired || !size || pixelCannons.length === 0) return;
    const t = setTimeout(() => {
      ref.current?.restart?.({ cannonsPositions: pixelCannons });
      setHasFired(true);
    }, autoStartDelayMs);
    return () => clearTimeout(t);
  }, [visible, skImage, pixelCannons, autoStartDelayMs, hasFired, size]);

  // After blast finishes, increase flake size for fall
  useEffect(() => {
    if (!hasFired) return;
    const grow = setTimeout(() => {
      setCurrentFlakeSize(fallFlakeSize);
    }, blastDuration);
    return () => clearTimeout(grow);
  }, [hasFired, blastDuration, fallFlakeSize]);

  // Unmount right after blast completes so flakes don't fall
  useEffect(() => {
    if (!hasFired || ended) return;
    const t = setTimeout(() => {
      ref.current?.reset?.();
      setEnded(true);
    }, blastDuration);
    return () => clearTimeout(t);
  }, [hasFired, blastDuration, ended]);

  if (!visible || ended) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        if (width && height) setSize({ width, height });
      }}
    >
      {skImage && size && (
        <Confetti
          ref={ref}
          type="image"
          flakeImage={skImage}
          count={count}
          fallDuration={fallDuration}
          blastDuration={blastDuration}
          flakeSize={currentFlakeSize}
          sizeVariation={sizeVariation}
          randomSpeed={randomSpeed}
          randomOffset={randomOffset}
          cannonsPositions={pixelCannons}
          width={size.width}
          height={size.height}
          containerStyle={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onAnimationEnd={() => {
            // Ensure no further plays
            ref.current?.reset?.();
            setEnded(true);
          }}
        />
      )}
    </View>
  );
};
