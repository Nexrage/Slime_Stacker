import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';

interface GridBackgroundProps {
  spacing?: number; // distance between grid lines
  thickness?: number; // line thickness
  color?: string; // line color
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  spacing = 64,
  thickness = 6,
  color = '#FFFFFF',
}) => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const { verticalLines, horizontalLines } = useMemo(() => {
    if (!size) return { verticalLines: [] as number[], horizontalLines: [] as number[] };
    const v: number[] = [];
    for (let x = 0; x <= size.width + spacing; x += spacing) v.push(x);
    const h: number[] = [];
    for (let y = 0; y <= size.height + spacing; y += spacing) h.push(y);
    return { verticalLines: v, horizontalLines: h };
  }, [size, spacing]);

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
          {verticalLines.map((x, i) => (
            <Rect key={`v-${i}`} x={x} y={0} width={thickness} height={size.height} color={color} />
          ))}
          {horizontalLines.map((y, i) => (
            <Rect key={`h-${i}`} x={0} y={y} width={size.width} height={thickness} color={color} />
          ))}
        </Canvas>
      )}
    </View>
  );
};
