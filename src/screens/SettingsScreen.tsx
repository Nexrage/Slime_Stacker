import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  HStack,
  Text,
  Switch,
  VStack,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadSettings, saveSettings, Settings } from '@/utils/storage';
import { audio } from '@/utils/audio';
import { audioEngine } from '@/utils/audioEngine';
import * as Haptics from 'expo-haptics';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [sound, setSound] = React.useState(true);
  const [music, setMusic] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);

  useEffect(() => {
    loadSettings().then(s => {
      setSound(s.sound);
      setMusic(s.music);
      setHaptics(s.haptics);
      audio.setSettings(s);
      audioEngine.setEnabled(s.sound);
    });
  }, []);

  useEffect(() => {
    const s: Settings = { sound, music, haptics };
    saveSettings(s).then(() => {
      audio.setSettings(s);
      audioEngine.setEnabled(sound);
    });
  }, [sound, music, haptics]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} p="$6">
        <HStack justifyContent="space-between" alignItems="center" mb="$6">
          <Heading>Settings</Heading>
          <Button onPress={() => navigation.goBack()} size="sm" variant="outline">
            <ButtonText>Back</ButtonText>
          </Button>
        </HStack>
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
            <Switch
              value={haptics}
              onValueChange={v => {
                setHaptics(v);
                // immediate feedback on toggle
                if (v) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            />
          </HStack>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};
