import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Canvas, Circle, Group, Blur } from '@shopify/react-native-skia';

interface AtmosphericParticlesProps {
  visible: boolean;
  particleCount?: number; // total particles across layers
  intensity?: number; // 0..1 overall opacity multiplier
  colors?: string[]; // particle color palette
}

type Particle = {
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  r: number; // radius px at base height=800
  a: number; // 0..1 base alpha
  c: number; // color index
};

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({
  visible,
  particleCount = 60,
  intensity = 0.6,
  colors: paletteProp,
}) => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [timeMs, setTimeMs] = useState(0);

  // Split into 3 parallax layers
  const layerSpecs = useMemo(() => {
    return [
      { speed: 6, blur: 2, opacity: 0.25 },
      { speed: 10, blur: 1.5, opacity: 0.35 },
      { speed: 18, blur: 1, opacity: 0.5 },
    ];
  }, []);

  const layers = useMemo(() => {
    // Distribute particles roughly evenly across layers
    const perLayer = Math.max(1, Math.floor(particleCount / layerSpecs.length));
    const rand = (seed: number) => {
      // simple LCG for stable randomness
      let x = seed;
      return () => {
        x = (1664525 * x + 1013904223) % 4294967296;
        return x / 4294967296;
      };
    };
    return layerSpecs.map((_, li) => {
      const r = rand(12345 + li * 999);
      const particles: Particle[] = Array.from({ length: perLayer }).map(() => ({
        x: r(),
        y: r(),
        r: 1 + r() * 2.5, // base radius
        a: 0.2 + r() * 0.8,
        c: Math.floor(r() * 99999), // temp seed; will map to palette length later
      }));
      return particles;
    });
  }, [layerSpecs, particleCount]);

  const palette = useMemo(
    () =>
      paletteProp && paletteProp.length > 0
        ? paletteProp
        : ['#ffffff', '#A0E7E5', '#B4F8C8', '#FBE7C6', '#FFAEBC'],
    [paletteProp]
  );

  const toRgba = (hex: string, alpha: number) => {
    if (hex.startsWith('#') && (hex.length === 7 || hex.length === 4)) {
      let r = 255,
        g = 255,
        b = 255;
      if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      } else if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      }
      return `rgba(${r},${g},${b},${alpha})`;
    }
    // fallback for rgba() inputs
    return hex;
  };

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

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -3 }}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        if (width && height) setSize({ width, height });
      }}
    >
      {size && (
        <Canvas style={{ position: 'absolute', width: size.width, height: size.height }}>
          {layers.map((particles, li) => {
            const spec = layerSpecs[li];
            const w = size.width;
            const t = timeMs / 1000;
            const off = ((t * spec.speed + li * 0.33) % 1) * w;
            return (
              <Group
                key={`layer-${li}`}
                opacity={spec.opacity * intensity}
                transform={[{ translateX: off }, { translateY: 0 }] as any}
              >
                <Blur blur={spec.blur} />
                {particles.map((p, i) => {
                  const base = palette[(p.c + i) % palette.length];
                  const color = toRgba(base, 0.25 * p.a);
                  return (
                    <Circle
                      key={`p-${li}-${i}`}
                      cx={(p.x * size.width - off + size.width) % size.width}
                      cy={(p.y * size.height + li * 13) % size.height}
                      r={p.r}
                      color={color}
                    />
                  );
                })}
              </Group>
            );
          })}
        </Canvas>
      )}
    </View>
  );
};
