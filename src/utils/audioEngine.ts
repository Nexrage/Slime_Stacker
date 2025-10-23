import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type SoundType = 'click-a' | 'click-b' | 'tap-a' | 'tap-b' | 'switch-a' | 'switch-b';

class AudioEngine {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private backgroundMusic: Audio.Sound | null = null;
  private creditsMusic: Audio.Sound | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.7;
  private musicVolume: number = 0.3;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  async initialize() {
    try {
      if (this.initialized) {
        return;
      }
      if (this.initPromise) {
        await this.initPromise;
        return;
      }

      console.log('🎵 Initializing audio engine...');

      this.initPromise = (async () => {
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

        // Load background music
        console.log('Loading background music...');
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/colt-fingaz-game-boi-312535.mp3'),
          {
            shouldPlay: false,
            isLooping: true,
            volume: this.musicVolume,
          }
        );
        this.backgroundMusic = sound;
        console.log('✅ Background music loaded');

        // Load credits music
        console.log('Loading credits music...');
        const { sound: creditsSound } = await Audio.Sound.createAsync(
          require('../../assets/audio/sweet-bitcrush-8-bit-lofi-rap-beat-prod-by-onesevenbeatxs-321302.mp3'),
          {
            shouldPlay: false,
            isLooping: true,
            volume: this.musicVolume,
          }
        );
        this.creditsMusic = creditsSound;
        console.log('✅ Credits music loaded');

        console.log(`🎵 Audio engine initialized with ${this.sounds.size} Kenney sounds`);
        this.initialized = true;
        this.initPromise = null;
      })();

      await this.initPromise;
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      this.initPromise = null;
    }
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    await this.initialize();
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

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.setVolumeAsync(this.musicVolume);
    }
    if (this.creditsMusic) {
      this.creditsMusic.setVolumeAsync(this.musicVolume);
    }
  }

  async playBackgroundMusic() {
    await this.ensureInitialized();
    if (!this.isEnabled || !this.backgroundMusic) {
      console.log('🔇 Background music disabled or not loaded');
      return;
    }
    
    try {
      console.log('🎵 Starting background music (colt-fingaz-game-boi-312535.mp3)...');
      await this.backgroundMusic.playAsync();
      console.log('✅ Background music is now playing');
    } catch (error) {
      console.warn('❌ Failed to play background music:', error);
    }
  }

  async pauseBackgroundMusic() {
    if (!this.backgroundMusic) {
      console.log('🔇 Background music not loaded, cannot pause');
      return;
    }
    
    try {
      console.log('⏸️ Pausing background music (colt-fingaz-game-boi-312535.mp3)...');
      await this.backgroundMusic.pauseAsync();
      console.log('✅ Background music paused');
    } catch (error) {
      console.warn('❌ Failed to pause background music:', error);
    }
  }

  async stopBackgroundMusic() {
    if (!this.backgroundMusic) {
      console.log('🔇 Background music not loaded, cannot stop');
      return;
    }
    
    try {
      console.log('⏹️ Stopping background music (colt-fingaz-game-boi-312535.mp3)...');
      await this.backgroundMusic.stopAsync();
      console.log('✅ Background music stopped');
    } catch (error) {
      console.warn('❌ Failed to stop background music:', error);
    }
  }

  async playCreditsMusic() {
    await this.ensureInitialized();
    if (!this.isEnabled || !this.creditsMusic) {
      console.log('🔇 Credits music disabled or not loaded');
      return;
    }
    
    try {
      console.log('🎵 Starting credits music (sweet-bitcrush-8-bit-lofi-rap-beat-prod-by-onesevenbeatxs-321302.mp3)...');
      await this.creditsMusic.playAsync();
      console.log('✅ Credits music is now playing');
    } catch (error) {
      console.warn('❌ Failed to play credits music:', error);
    }
  }

  async pauseCreditsMusic() {
    if (!this.creditsMusic) {
      console.log('🔇 Credits music not loaded, cannot pause');
      return;
    }
    
    try {
      console.log('⏸️ Pausing credits music (sweet-bitcrush-8-bit-lofi-rap-beat-prod-by-onesevenbeatxs-321302.mp3)...');
      await this.creditsMusic.pauseAsync();
      console.log('✅ Credits music paused');
    } catch (error) {
      console.warn('❌ Failed to pause credits music:', error);
    }
  }

  async stopCreditsMusic() {
    if (!this.creditsMusic) {
      console.log('🔇 Credits music not loaded, cannot stop');
      return;
    }
    
    try {
      console.log('⏹️ Stopping credits music (sweet-bitcrush-8-bit-lofi-rap-beat-prod-by-onesevenbeatxs-321302.mp3)...');
      await this.creditsMusic.stopAsync();
      console.log('✅ Credits music stopped');
    } catch (error) {
      console.warn('❌ Failed to stop credits music:', error);
    }
  }

  // Test function to verify audio is working
  async testAudio() {
    console.log('🧪 Testing audio...');
    await this.playClick();
  }

  // Log current audio status
  async logAudioStatus() {
    console.log('🎵 === AUDIO STATUS ===');
    console.log(`🔊 Audio enabled: ${this.isEnabled}`);
    console.log(`🔊 Sound effects volume: ${this.volume}`);
    console.log(`🎵 Music volume: ${this.musicVolume}`);
    
    if (this.backgroundMusic) {
      const status = await this.backgroundMusic.getStatusAsync();
      console.log(`🎵 Background music (colt-fingaz): ${status.isLoaded ? 'LOADED' : 'NOT LOADED'} | ${status.isPlaying ? 'PLAYING' : 'NOT PLAYING'}`);
    } else {
      console.log('🎵 Background music: NOT LOADED');
    }
    
    if (this.creditsMusic) {
      const status = await this.creditsMusic.getStatusAsync();
      console.log(`🎵 Credits music (sweet-bitcrush): ${status.isLoaded ? 'LOADED' : 'NOT LOADED'} | ${status.isPlaying ? 'PLAYING' : 'NOT PLAYING'}`);
    } else {
      console.log('🎵 Credits music: NOT LOADED');
    }
    
    console.log(`🔊 Sound effects loaded: ${this.sounds.size} sounds`);
    console.log('🎵 === END AUDIO STATUS ===');
  }

  async cleanup() {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
    
    if (this.backgroundMusic) {
      await this.backgroundMusic.unloadAsync();
      this.backgroundMusic = null;
    }
    
    if (this.creditsMusic) {
      await this.creditsMusic.unloadAsync();
      this.creditsMusic = null;
    }
  }
}

// Export singleton instance
export const audioEngine = new AudioEngine();
