import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type SoundType = 'click-a' | 'click-b' | 'tap-a' | 'tap-b' | 'switch-a' | 'switch-b';

class AudioEngine {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  async initialize() {
    try {
      console.log('🎵 Initializing audio engine...');
      
      // Set audio mode for better sound playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Load all Kenney sound effects (use .mp3 on iOS, .ogg elsewhere)
      const soundFiles: Record<SoundType, any> = Platform.OS === 'ios'
        ? {
            'click-a': require('../../assets/kenney_ui-pack/Sounds/click-a.mp3'),
            'click-b': require('../../assets/kenney_ui-pack/Sounds/click-b.mp3'),
            'tap-a': require('../../assets/kenney_ui-pack/Sounds/tap-a.mp3'),
            'tap-b': require('../../assets/kenney_ui-pack/Sounds/tap-b.mp3'),
            'switch-a': require('../../assets/kenney_ui-pack/Sounds/switch-a.mp3'),
            'switch-b': require('../../assets/kenney_ui-pack/Sounds/switch-b.mp3'),
          }
        : {
            'click-a': require('../../assets/kenney_ui-pack/Sounds/click-a.ogg'),
            'click-b': require('../../assets/kenney_ui-pack/Sounds/click-b.ogg'),
            'tap-a': require('../../assets/kenney_ui-pack/Sounds/tap-a.ogg'),
            'tap-b': require('../../assets/kenney_ui-pack/Sounds/tap-b.ogg'),
            'switch-a': require('../../assets/kenney_ui-pack/Sounds/switch-a.ogg'),
            'switch-b': require('../../assets/kenney_ui-pack/Sounds/switch-b.ogg'),
          };

      for (const [soundType, soundFile] of Object.entries(soundFiles)) {
        console.log(`Loading sound: ${soundType}`);
        const { sound } = await Audio.Sound.createAsync(soundFile, {
          shouldPlay: false,
          isLooping: false,
          volume: this.volume,
        });
        this.sounds.set(soundType as SoundType, sound);
        console.log(`✅ Loaded: ${soundType}`);
      }

      console.log(`🎵 Audio engine initialized with ${this.sounds.size} Kenney sounds`);
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
    }
  }

  async playSound(soundType: SoundType) {
    if (!this.isEnabled) {
      console.log('🔇 Audio disabled');
      return;
    }

    try {
      const sound = this.sounds.get(soundType);
      if (sound) {
        console.log(`🔊 Playing sound: ${soundType}`);
        // Reset position to beginning
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } else {
        console.warn(`Sound ${soundType} not loaded`);
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  }

  // UI interaction sounds
  async playClick() {
    // Alternate between click-a and click-b for variety
    const useA = Math.random() < 0.5;
    await this.playSound(useA ? 'click-a' : 'click-b');
  }

  async playTap() {
    // Alternate between tap-a and tap-b for variety
    const useA = Math.random() < 0.5;
    await this.playSound(useA ? 'tap-a' : 'tap-b');
  }

  async playSwitch() {
    // Alternate between switch-a and switch-b for variety
    const useA = Math.random() < 0.5;
    await this.playSound(useA ? 'switch-a' : 'switch-b');
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    // Update volume for all loaded sounds
    this.sounds.forEach(sound => {
      sound.setVolumeAsync(this.volume);
    });
  }

  // Test function to verify audio is working
  async testAudio() {
    console.log('🧪 Testing audio...');
    await this.playClick();
  }

  async cleanup() {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

// Export singleton instance
export const audioEngine = new AudioEngine();
