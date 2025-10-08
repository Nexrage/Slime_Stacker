import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { config } from '@gluestack-ui/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TitleScreen } from '@/screens/TitleScreen';
import { MainMenuScreen } from '@/screens/MainMenuScreen';
import { TutorialScreen } from '@/screens/TutorialScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { LevelSelectScreen } from '@/screens/LevelSelectScreen';
import { GameScreen } from '@/screens/GameScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GluestackUIProvider config={config}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Title" component={TitleScreen} />
              <Stack.Screen name="MainMenu" component={MainMenuScreen} />
              <Stack.Screen name="Tutorial" component={TutorialScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
