import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Heading, Text, VStack, HStack, Button, ButtonText } from '@gluestack-ui/themed';

export const TutorialScreen: React.FC<any> = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} p="$6">
        <Heading mb="$4">How to Play</Heading>
        <VStack space="md">
          <Box>
            <Heading size="md" mb="$2">
              Controls
            </Heading>
            <Text>• Tap: Rotate</Text>
            <Text>• Swipe Left/Right: Move</Text>
            <Text>• Swipe Down: Soft drop</Text>
            <Text>• Swipe Up: Hard drop</Text>
            <Text>• Long-press: Hold current pair</Text>
          </Box>

          <Box>
            <Heading size="md" mb="$2">
              Goal
            </Heading>
            <Text>• Clear stars by sandwiching them between matching friends (Rick/Coo/Kine).</Text>
            <Text>• Friend clusters (2+ touching) also clear.</Text>
            <Text>• Bomb clears its entire row; Brick cracks, then clears on second sandwich.</Text>
          </Box>

          <Box>
            <Heading size="md" mb="$2">
              Chains & Bonus
            </Heading>
            <Text>• Clears cause gravity; new matches form chains.</Text>
            <Text>• Chains drop bonus stars into the two least-filled columns.</Text>
          </Box>

          <Box>
            <Heading size="md" mb="$2">
              Game Flow
            </Heading>
            <Text>• Pairs spawn at the top of columns 3–4.</Text>
            <Text>• Interim phase auto-resolves matches; input is briefly locked.</Text>
            <Text>• New pair spawns when the board is stable.</Text>
          </Box>

          <Box>
            <Heading size="md" mb="$2">
              Tips
            </Heading>
            <Text>• Flashing blocks show what will clear/crack/explode during chains.</Text>
            <Text>• Hard drop lands instantly and gives a strong haptic.</Text>
          </Box>

          <HStack mt="$6" space="md">
            <Button onPress={() => navigation.goBack()} accessibilityLabel="Back to Menu">
              <ButtonText>Back</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};
