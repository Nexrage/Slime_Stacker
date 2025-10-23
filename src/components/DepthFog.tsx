import React, { useMemo, useState, useEffect } from 'react';
import { View } from 'react-native';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';

interface DepthFogProps {
  visible: boolean;
  intensity?: number; // 0..1
  color?: string; // base fog color
}

export const DepthFog: React.FC<DepthFogProps> = ({
  visible,
  intensity = 0.25,
  color = '#87CEEB',
}) => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [timeMs, setTimeMs] = useState(0);

  const opacity = Math.max(0, Math.min(1, intensity));

  useEffect(() => {
    let raf = 0;
    let start = Date.now();
    const loop = () => {
      setTimeMs(Date.now() - start);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const colors = useMemo(() => {
    // top more transparent, bottom thicker
    return [
      `${color}00`, // transparent
      `${color}22`,
      `${color}55`,
      `${color}88`,
    ];
  }, [color]);

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
      {size && (
        <Canvas style={{ position: 'absolute', width: size.width, height: size.height }}>
          <Rect x={0} y={0} width={size.width} height={size.height} opacity={opacity}>
            <LinearGradient
              start={vec(size.width / 2, -Math.sin(timeMs / 4000) * (size.height * 0.05))}
              end={vec(
                size.width / 2,
                size.height + Math.sin(timeMs / 4000) * (size.height * 0.05)
              )}
              colors={colors}
            />
          </Rect>
        </Canvas>
      )}
    </View>
  );
};
