import React from 'react';
import { HStack, Text, Box, Image } from '@gluestack-ui/themed';
import { BlockType } from '@/game/BlockTypes';

const spriteFor = (name?: string) => {
  switch (name as keyof typeof BlockType) {
    default: {
      // map string to known filenames
      const lower = (name || '').toLowerCase();
      if (lower === 'rick') return require('../../assets/sprites/hamster.png');
      if (lower === 'coo') return require('../../assets/sprites/bird.png');
      if (lower === 'kine') return require('../../assets/sprites/fish.png');
      if (lower === 'star') return require('../../assets/sprites/star.png');
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
    <Box bg="$background0" px="$3" py="$2" style={{ borderColor: '#008800', borderWidth: 1 }}>
      <HStack justifyContent="space-between" style={{ borderColor: '#00aa00', borderWidth: 1 }}>
        <Text>Score {score}</Text>
        <Text>
          Level {level} {mode ? `• ${mode}` : ''} {difficulty || ''}
        </Text>
      </HStack>
      <HStack
        justifyContent="space-between"
        alignItems="center"
        style={{ borderColor: '#00cc00', borderWidth: 1 }}
      >
        <HStack alignItems="center" space="sm">
          <Text>Next:</Text>
          {next ? (
            <HStack alignItems="center" space="xs">
              {spriteFor(next[0]) ? (
                <Image
                  source={spriteFor(next[0]) as any}
                  alt={next[0]}
                  style={{ width: 20, height: 20 }}
                />
              ) : (
                <Text>{next[0]}</Text>
              )}
              {spriteFor(next[1]) ? (
                <Image
                  source={spriteFor(next[1]) as any}
                  alt={next[1]}
                  style={{ width: 20, height: 20 }}
                />
              ) : (
                <Text>{next[1]}</Text>
              )}
            </HStack>
          ) : (
            <Text>-</Text>
          )}
        </HStack>
        <HStack alignItems="center" space="sm">
          <Text>Hold:</Text>
          {hold ? (
            <HStack alignItems="center" space="xs">
              {spriteFor(hold[0]) ? (
                <Image
                  source={spriteFor(hold[0]) as any}
                  alt={hold[0]}
                  style={{ width: 20, height: 20 }}
                />
              ) : (
                <Text>{hold[0]}</Text>
              )}
              {spriteFor(hold[1]) ? (
                <Image
                  source={spriteFor(hold[1]) as any}
                  alt={hold[1]}
                  style={{ width: 20, height: 20 }}
                />
              ) : (
                <Text>{hold[1]}</Text>
              )}
              {canHold === false ? <Text> (locked)</Text> : null}
            </HStack>
          ) : (
            <Text>-</Text>
          )}
        </HStack>
      </HStack>
    </Box>
  );
};
