import React from 'react';
import { ImageConfettiCannon } from './ImageConfettiCannon';

interface TileConfettiCannonsProps {
  visible: boolean;
}

export const TileConfettiCannons: React.FC<TileConfettiCannonsProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <>
      <ImageConfettiCannon
        visible={visible}
        image={require('../../assets/sprites/confetti_images/blue.png')}
        cannonsPositions={[
          { x: 0.15, y: 0.5 },
          { x: 0.35, y: 0.5 },
        ]}
        count={2}
        fallDuration={12000}
        blastDuration={2500}
        flakeSize={{ width: 24, height: 24 }}
        fallFlakeSize={{ width: 40, height: 40 }}
        sizeVariation={0.25}
        randomSpeed={{ min: 0.5, max: 0.8 }}
        randomOffset={{ x: { min: -25, max: 25 }, y: { min: -120, max: -40 } }}
        autoStartDelayMs={300}
      />

      <ImageConfettiCannon
        visible={visible}
        image={require('../../assets/sprites/confetti_images/green.png')}
        cannonsPositions={[
          { x: 0.65, y: 0.5 },
          { x: 0.85, y: 0.5 },
        ]}
        count={2}
        fallDuration={12000}
        blastDuration={2500}
        flakeSize={{ width: 24, height: 24 }}
        fallFlakeSize={{ width: 40, height: 40 }}
        sizeVariation={0.25}
        randomSpeed={{ min: 0.5, max: 0.8 }}
        randomOffset={{ x: { min: -25, max: 25 }, y: { min: -120, max: -40 } }}
        autoStartDelayMs={300}
      />

      <ImageConfettiCannon
        visible={visible}
        image={require('../../assets/sprites/confetti_images/red.png')}
        cannonsPositions={[
          { x: 0.25, y: 0.5 },
          { x: 0.75, y: 0.5 },
        ]}
        count={2}
        fallDuration={12000}
        blastDuration={2500}
        flakeSize={{ width: 24, height: 24 }}
        fallFlakeSize={{ width: 40, height: 40 }}
        sizeVariation={0.2}
        randomSpeed={{ min: 0.5, max: 0.8 }}
        randomOffset={{ x: { min: -20, max: 20 }, y: { min: -110, max: -30 } }}
        autoStartDelayMs={300}
      />

      <ImageConfettiCannon
        visible={visible}
        image={require('../../assets/sprites/confetti_images/yellow.png')}
        cannonsPositions={[{ x: 0.5, y: 0.5 }]}
        count={2}
        fallDuration={12000}
        blastDuration={2500}
        flakeSize={{ width: 24, height: 24 }}
        fallFlakeSize={{ width: 40, height: 40 }}
        sizeVariation={0.2}
        randomSpeed={{ min: 0.5, max: 0.8 }}
        randomOffset={{ x: { min: -20, max: 20 }, y: { min: -110, max: -30 } }}
        autoStartDelayMs={300}
      />
    </>
  );
};
