import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonText, Heading, VStack } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadSettings, updateSettings } from '@/utils/storage';

const DIFFICULTIES = ['Normal', 'Hard', 'Very Hard', 'Super Hard', 'Insane'];

export const LevelSelectScreen: React.FC<any> = ({ navigation }) => {
  const [last, setLast] = useState<string | undefined>(undefined);
  useEffect(() => {
    loadSettings().then(s => setLast(s.lastDifficulty));
  }, []);
  const onPick = async (label: string) => {
    const s = await updateSettings({ lastDifficulty: label });
    setLast(s.lastDifficulty);
    navigation.navigate('Game', { mode: 'roundClear', difficulty: label });
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} p="$6">
        <Heading mb="$4">Round Clear</Heading>
        <VStack>
          {DIFFICULTIES.map(label => (
            <Button key={label} onPress={() => onPick(label)} mb="$3">
              <ButtonText>
                {label}
                {last === label ? '  (last)' : ''}
              </ButtonText>
            </Button>
          ))}
          <Button onPress={() => navigation.goBack()}>
            <ButtonText>Back</ButtonText>
          </Button>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};
