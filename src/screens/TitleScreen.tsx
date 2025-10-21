import React from 'react';
import {
  Center,
  Heading,
  Button,
  ButtonText,
  HStack,
  Image as GSImage,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBackground } from 'react-native';
import { audioEngine } from '@/utils/audioEngine';

export const TitleScreen: React.FC<any> = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <Center flex={1} px="$8" pt="$8">
        <Center>
          <Heading
            style={{
              fontSize: 36,
              fontFamily: 'Kenney-Future',
              textAlign: 'center',
              marginBottom: 48,
              color: '#2D2D2D',
              textShadowColor: 'rgba(255,255,255,0.8)',
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4,
              flexWrap: 'nowrap',
              alignSelf: 'center',
            }}
          >
            Star Stacker
          </Heading>
          <ImageBackground
            resizeMode="stretch"
            source={require('../../assets/kenney_ui-pack/PNG/Yellow/Default/button_rectangle_depth_gloss.png')}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Button
              onPress={() => {
                console.log('🎵 Title screen button pressed');
                audioEngine.playClick();
                navigation.replace('MainMenu');
              }}
              variant="link"
              size="xl"
              style={{
                backgroundColor: 'transparent',
                paddingHorizontal: 24,
                paddingVertical: 12,
                minHeight: 56,
              }}
            >
              <HStack alignItems="center" space="md">
                <GSImage
                  alt="play"
                  source={require('../../assets/kenney_ui-pack/PNG/Extra/Default/icon_play_light.png')}
                  style={{ width: 28, height: 28 }}
                />
                <ButtonText
                  style={{
                    fontFamily: 'Kenney-Future-Narrow',
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#2D2D2D',
                  }}
                >
                  Start Game
                </ButtonText>
              </HStack>
            </Button>
          </ImageBackground>
        </Center>
      </Center>
    </SafeAreaView>
  );
};
