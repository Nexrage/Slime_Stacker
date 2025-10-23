import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  HStack,
  Text,
  VStack,
  Button,
  ButtonText,
  Divider,
  Image as GSImage,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadSettings, saveSettings, Settings } from '@/utils/storage';
import { audio } from '@/utils/audio';
import { audioEngine } from '@/utils/audioEngine';
import * as Haptics from 'expo-haptics';
import { ImageBackground, View } from 'react-native';
import { DepthFog } from '@/components/DepthFog';
import { GridBackground } from '@/components/GridBackground';
import { LightRays } from '@/components/LightRays';

const KenneyButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  icon?: any;
}> = ({ onPress, children, size = 'md', icon }) => {
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
      style={{ borderRadius: 8, overflow: 'hidden' }}
    >
      <Button
        onPress={onPress}
        size={size}
        variant="link"
        style={{ backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 6 }}
      >
        <HStack alignItems="center" space="sm">
          {icon && <GSImage alt="icon" source={icon} style={{ width: 16, height: 16 }} />}
          <ButtonText style={{ fontFamily: 'Kenney-Future-Narrow' }}>{children}</ButtonText>
        </HStack>
      </Button>
    </ImageBackground>
  );
};

const KenneySegmentToggle: React.FC<{
  value: boolean;
  onValueChange: (v: boolean) => void;
  onIcon?: any;
  offIcon?: any;
}> = ({ value, onValueChange, onIcon, offIcon }) => {
  return (
    <HStack space="sm" alignItems="center">
      <ImageBackground
        resizeMode="stretch"
        source={
          !value
            ? require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')
            : require('../../assets/kenney_ui-pack/PNG/Grey/Default/button_rectangle_depth_gloss.png')
        }
        style={{ borderRadius: 8, overflow: 'hidden' }}
      >
        <Button
          variant="link"
          size="sm"
          onPress={() => onValueChange(false)}
          style={{
            backgroundColor: 'transparent',
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <HStack alignItems="center" space="xs">
            {offIcon && (
              <GSImage alt="off icon" source={offIcon} style={{ width: 14, height: 14 }} />
            )}
            <ButtonText style={{ fontFamily: 'Kenney-Future-Narrow' }}>OFF</ButtonText>
          </HStack>
        </Button>
      </ImageBackground>
      <ImageBackground
        resizeMode="stretch"
        source={
          value
            ? require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')
            : require('../../assets/kenney_ui-pack/PNG/Grey/Default/button_rectangle_depth_gloss.png')
        }
        style={{ borderRadius: 8, overflow: 'hidden' }}
      >
        <Button
          variant="link"
          size="sm"
          onPress={() => onValueChange(true)}
          style={{
            backgroundColor: 'transparent',
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <HStack alignItems="center" space="xs">
            {onIcon && <GSImage alt="on icon" source={onIcon} style={{ width: 14, height: 14 }} />}
            <ButtonText style={{ fontFamily: 'Kenney-Future-Narrow' }}>ON</ButtonText>
          </HStack>
        </Button>
      </ImageBackground>
    </HStack>
  );
};

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
      // Apply music setting immediately on entry
      if (s.music) {
        audioEngine.playBackgroundMusic();
      } else {
        audioEngine.pauseBackgroundMusic();
      }
    });
  }, []);

  useEffect(() => {
    const s: Settings = { sound, music, haptics };
    saveSettings(s).then(() => {
      audio.setSettings(s);
      audioEngine.setEnabled(sound);
      // Live-apply music preference
      if (music) {
        audioEngine.playBackgroundMusic();
      } else {
        audioEngine.pauseBackgroundMusic();
      }
    });
  }, [sound, music, haptics]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FF' }}>
      {/* Ambient effects outside safe area, full screen */}
      <DepthFog visible intensity={0.1} color="#2D1B3D" />
      {/* Grid background layered over depth fog */}
      <GridBackground spacing={64} thickness={6} color="#F8F9FF" />
      <LightRays visible rayCount={3} intensity={1} color="#F8F9FF" />

      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} p="$6">
          <HStack justifyContent="space-between" alignItems="center" mb="$6">
            <Heading style={{ fontFamily: 'Kenney-Future' }}>Settings</Heading>
            <View style={{ width: 110 }}>
              <KenneyButton
                onPress={() => navigation.goBack()}
                size="sm"
                icon={require('../../assets/kenney_ui-pack/PNG/Blue/Default/arrow_basic_w.png')}
              >
                Back
              </KenneyButton>
            </View>
          </HStack>

          <VStack space="lg">
            <Box>
              <Heading size="md" mb="$3" style={{ fontFamily: 'Kenney-Future' }}>
                Audio
              </Heading>
              <VStack>
                <HStack alignItems="center" justifyContent="space-between" mb="$4">
                  <HStack alignItems="center" space="sm">
                    <GSImage
                      alt="sound icon"
                      source={require('../../assets/kenney_ui-pack/PNG/Blue/Default/icon_checkmark.png')}
                      style={{ width: 20, height: 20 }}
                    />
                    <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>Sound</Text>
                  </HStack>
                  <KenneySegmentToggle
                    value={sound}
                    onValueChange={newValue => {
                      setSound(newValue);
                      if (newValue) {
                        audioEngine.playClick();
                      }
                    }}
                    onIcon={require('../../assets/kenney_ui-pack/PNG/Green/Default/icon_checkmark.png')}
                    offIcon={require('../../assets/kenney_ui-pack/PNG/Red/Default/icon_cross.png')}
                  />
                </HStack>
                <HStack alignItems="center" justifyContent="space-between" mb="$4">
                  <HStack alignItems="center" space="sm">
                    <GSImage
                      alt="music icon"
                      source={require('../../assets/kenney_ui-pack/PNG/Extra/Default/icon_play_light.png')}
                      style={{ width: 20, height: 20 }}
                    />
                    <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>Music</Text>
                  </HStack>
                  <KenneySegmentToggle
                    value={music}
                    onValueChange={newValue => {
                      setMusic(newValue);
                      if (newValue) {
                        audioEngine.playClick();
                      }
                    }}
                    onIcon={require('../../assets/kenney_ui-pack/PNG/Extra/Default/icon_play_light.png')}
                    offIcon={require('../../assets/kenney_ui-pack/PNG/Extra/Default/icon_arrow_down_light.png')}
                  />
                </HStack>
              </VStack>
            </Box>

            <Divider />

            <Box>
              <Heading size="md" mb="$3" style={{ fontFamily: 'Kenney-Future' }}>
                Feedback
              </Heading>
              <VStack>
                <HStack alignItems="center" justifyContent="space-between" mb="$4">
                  <HStack alignItems="center" space="sm">
                    <GSImage
                      alt="haptics icon"
                      source={require('../../assets/kenney_ui-pack/PNG/Blue/Default/icon_square.png')}
                      style={{ width: 20, height: 20 }}
                    />
                    <Text style={{ fontFamily: 'Kenney-Future-Narrow' }}>Vibration</Text>
                  </HStack>
                  <KenneySegmentToggle
                    value={haptics}
                    onValueChange={v => {
                      setHaptics(v);
                      if (v) {
                        audioEngine.playClick();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                    }}
                    onIcon={require('../../assets/kenney_ui-pack/PNG/Green/Default/icon_checkmark.png')}
                    offIcon={require('../../assets/kenney_ui-pack/PNG/Red/Default/icon_cross.png')}
                  />
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </SafeAreaView>
    </View>
  );
};
