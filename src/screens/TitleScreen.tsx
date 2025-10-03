import React, { useEffect } from 'react';
import { Center, Heading, Button, ButtonText } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

export const TitleScreen: React.FC<any> = ({ navigation }) => {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('MainMenu'), 1200);
    return () => clearTimeout(t);
  }, [navigation]);
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
