import React, { useEffect } from 'react';
import { Box, Heading, HStack, Text, Switch, VStack } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadSettings, saveSettings, Settings } from '@/utils/storage';
import { audio } from '@/utils/audio';

export const SettingsScreen: React.FC = () => {
  const [sound, setSound] = React.useState(true);
  const [music, setMusic] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);

  useEffect(() => {
    loadSettings().then(s => {
      setSound(s.sound);
      setMusic(s.music);
      setHaptics(s.haptics);
      audio.setSettings(s);
    });
  }, []);

  useEffect(() => {
    const s: Settings = { sound, music, haptics };
    saveSettings(s).then(() => audio.setSettings(s));
  }, [sound, music, haptics]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} p="$6">
        <Heading mb="$6">Settings</Heading>
        <VStack>
          <HStack alignItems="center" justifyContent="space-between" mb="$4">
            <Text>Sound Effects</Text>
            <Switch value={sound} onValueChange={setSound} />
          </HStack>
          <HStack alignItems="center" justifyContent="space-between" mb="$4">
            <Text>Music</Text>
            <Switch value={music} onValueChange={setMusic} />
          </HStack>
          <HStack alignItems="center" justifyContent="space-between">
            <Text>Haptics</Text>
            <Switch value={haptics} onValueChange={setHaptics} />
          </HStack>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};
