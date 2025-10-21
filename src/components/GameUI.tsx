import React from 'react';
import { HStack, Text, Box, Image } from '@gluestack-ui/themed';
import { ImageBackground } from 'react-native';
import { BlockType } from '@/game/BlockTypes';

const spriteFor = (name?: string) => {
  switch (name as keyof typeof BlockType) {
    default: {
      // map string to known filenames
      const lower = (name || '').toLowerCase();
      if (lower === 'green_jelly') return require('../../assets/sprites/gifs/jelly-idle.gif');
      if (lower === 'red_jelly') return require('../../assets/sprites/gifs/red-jelly-idle.gif');
      if (lower === 'blue_jelly') return require('../../assets/sprites/gifs/blue-jelly-idle.gif');
      if (lower === 'star') return require('../../assets/sprites/icons/tile191.png');
      if (lower === 'brick') return require('../../assets/sprites/block.png');
      if (lower === 'bomb') return require('../../assets/sprites/bomb.png');
      return null;
    }
  }
};

export const GameUI: React.FC<{
  score?: number;
  level?: number;
  mode?: string;
  difficulty?: string;
  chains?: number;
  next?: [string, string] | null;
  hold?: [string, string] | null;
  canHold?: boolean;
}> = ({ score = 0, level = 1, mode, difficulty, chains = 0, next, hold, canHold }) => {
  return (
    <Box px="$3" py="$2">
      <ImageBackground
        resizeMode="stretch"
        source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_border.png')}
        style={{ padding: 8, borderRadius: 8, overflow: 'hidden' }}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" space="sm">
            <Image
              source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/star.png')}
              alt="score"
              style={{ width: 16, height: 16 }}
            />
            <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>Score {score}</Text>
            {chains > 0 ? (
              <HStack alignItems="center" space="xs">
                <Image
                  source={require('../../assets/kenney_ui-pack/PNG/Extra/Default/icon_repeat_dark.png')}
                  alt="chain"
                  style={{ width: 16, height: 16 }}
                />
                <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>x{chains}</Text>
              </HStack>
            ) : null}
          </HStack>
          <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>
            Level {level} {mode ? `• ${mode}` : ''} {difficulty || ''}
          </Text>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center" mt="$2">
          <HStack alignItems="center" space="sm">
            <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>Next:</Text>
            {next ? (
              <HStack alignItems="center" space="xs">
                {spriteFor(next[0]) ? (
                  <Image
                    source={spriteFor(next[0]) as any}
                    alt={next[0]}
                    style={{ width: 20, height: 20 }}
                  />
                ) : (
                  <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>{next[0]}</Text>
                )}
                {spriteFor(next[1]) ? (
                  <Image
                    source={spriteFor(next[1]) as any}
                    alt={next[1]}
                    style={{ width: 20, height: 20 }}
                  />
                ) : (
                  <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>{next[1]}</Text>
                )}
              </HStack>
            ) : (
              <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>-</Text>
            )}
          </HStack>
          <HStack alignItems="center" space="sm">
            <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>Hold:</Text>
            {hold ? (
              <HStack alignItems="center" space="xs">
                {spriteFor(hold[0]) ? (
                  <Image
                    source={spriteFor(hold[0]) as any}
                    alt={hold[0]}
                    style={{ width: 20, height: 20 }}
                  />
                ) : (
                  <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>{hold[0]}</Text>
                )}
                {spriteFor(hold[1]) ? (
                  <Image
                    source={spriteFor(hold[1]) as any}
                    alt={hold[1]}
                    style={{ width: 20, height: 20 }}
                  />
                ) : (
                  <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>{hold[1]}</Text>
                )}
                {canHold === false ? (
                  <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}> (locked)</Text>
                ) : null}
              </HStack>
            ) : (
              <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>-</Text>
            )}
          </HStack>
        </HStack>
      </ImageBackground>
    </Box>
  );
};
