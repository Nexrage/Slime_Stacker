import React from 'react';
import { HStack, Text, Box } from '@gluestack-ui/themed';

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
          {chains > 0 ? `Chain x${chains} • ` : ''}Level {level} {mode ? `• ${mode}` : ''}{' '}
          {difficulty || ''}
        </Text>
      </HStack>
      <HStack justifyContent="space-between" style={{ borderColor: '#00cc00', borderWidth: 1 }}>
        <Text>Next: {next ? `${next[0]} + ${next[1]}` : '-'}</Text>
        <Text>
          Hold: {hold ? `${hold[0]} + ${hold[1]}` : '-'}
          {canHold === false ? ' (locked)' : ''}
        </Text>
      </HStack>
    </Box>
  );
};
