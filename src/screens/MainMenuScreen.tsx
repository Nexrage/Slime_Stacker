import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonText, Heading, VStack } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadSettings, updateSettings } from '@/utils/storage';

export const MainMenuScreen: React.FC<any> = ({ navigation }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    loadSettings().then(s => setShowOnboarding(!s.onboarded));
  }, []);
  const dismissOnboarding = async () => {
    await updateSettings({ onboarded: true });
    setShowOnboarding(false);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} justifyContent="center" px="$6">
        <Heading textAlign="center" mb="$6">
          Main Menu
        </Heading>
        <VStack>
          <Button onPress={() => navigation.navigate('LevelSelect')} mb="$3">
            <ButtonText>Round Clear</ButtonText>
          </Button>
          <Button onPress={() => navigation.navigate('Game', { mode: 'challenge' })} mb="$3">
            <ButtonText>Challenge</ButtonText>
          </Button>
          <Button onPress={() => navigation.navigate('Game', { mode: 'timeAttack' })} mb="$3">
            <ButtonText>Time Attack</ButtonText>
          </Button>
          <Button onPress={() => navigation.navigate('Settings')}>
            <ButtonText>Settings</ButtonText>
          </Button>
        </VStack>
        {showOnboarding ? (
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
            accessibilityLabel="Onboarding Overlay"
          >
            <Box style={{ margin: 24, padding: 16, backgroundColor: '#111', borderRadius: 8 }}>
              <Heading mb="$3">How to Play</Heading>
              <Button onPress={dismissOnboarding}>
                <ButtonText>Got it</ButtonText>
              </Button>
            </Box>
          </Box>
        ) : null}
      </Box>
    </SafeAreaView>
  );
};
