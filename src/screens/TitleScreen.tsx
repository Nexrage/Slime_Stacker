import React from 'react';
import { Center, Heading, Button, ButtonText } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

export const TitleScreen: React.FC<any> = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Center flex={1}>
        <Heading style={{ fontSize: 36, fontWeight: '700' }} mb="$6">
          Star Stacker
        </Heading>
        <Button onPress={() => navigation.replace('MainMenu')}>
          <ButtonText>Start</ButtonText>
        </Button>
      </Center>
    </SafeAreaView>
  );
};
