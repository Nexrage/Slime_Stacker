import React from 'react';
import { ColorConfetti } from './ColorConfetti';

interface TileConfettiProps {
  visible: boolean;
  onAnimationEnd?: () => void;
}

export const TileConfetti: React.FC<TileConfettiProps> = ({ visible, onAnimationEnd }) => {
  if (!visible) return null;

  return (
    <>
      <ColorConfetti
        visible={visible}
        onAnimationEnd={onAnimationEnd}
        image={require('../../assets/sprites/confetti_images/blue.png')}
        count={8}
        fallDuration={15000}
        randomSpeed={{ min: 0.3, max: 0.7 }}
      />
      <ColorConfetti
        visible={visible}
        onAnimationEnd={onAnimationEnd}
        image={require('../../assets/sprites/confetti_images/green.png')}
        count={8}
        fallDuration={14000}
        randomSpeed={{ min: 0.4, max: 0.8 }}
      />
      <ColorConfetti
        visible={visible}
        onAnimationEnd={onAnimationEnd}
        image={require('../../assets/sprites/confetti_images/red.png')}
        count={7}
        fallDuration={13000}
        randomSpeed={{ min: 0.5, max: 0.9 }}
      />
      <ColorConfetti
        visible={visible}
        onAnimationEnd={onAnimationEnd}
        image={require('../../assets/sprites/confetti_images/yellow.png')}
        count={7}
        fallDuration={16000}
        randomSpeed={{ min: 0.2, max: 0.6 }}
      />
    </>
  );
};
