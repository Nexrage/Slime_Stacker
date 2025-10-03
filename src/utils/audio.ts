import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Settings, loadSettings, updateSettings } from '@/utils/storage';

type LoadedSound = { sound: Audio.Sound | null; playing: boolean };

class AudioManager {
  private static instance: AudioManager;
  private bgm: LoadedSound = { sound: null, playing: false };
  private sfxCache: Record<string, LoadedSound> = {};
  private settings: Settings | null = null;

  static get(): AudioManager {
    if (!AudioManager.instance) AudioManager.instance = new AudioManager();
    return AudioManager.instance;
  }

  async init() {
    this.settings = await loadSettings();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });
  }

  setSettings(s: Settings) {
    this.settings = s;
    if (!s.music) this.stopBgm();
  }

  async playBgmAsync(asset: number, isLooping: boolean = true) {
    if (!this.settings) await this.init();
    if (!this.settings?.music) return;
    if (this.bgm.sound) {
      await this.bgm.sound.stopAsync();
      await this.bgm.sound.unloadAsync();
      this.bgm = { sound: null, playing: false };
    }
    const { sound } = await Audio.Sound.createAsync(asset, { isLooping, volume: 0.5 });
    this.bgm = { sound, playing: true };
    await sound.playAsync();
  }

  async stopBgm() {
    if (this.bgm.sound) {
      await this.bgm.sound.stopAsync();
      await this.bgm.sound.unloadAsync();
      this.bgm = { sound: null, playing: false };
    }
  }

  async playSfxAsync(key: string, asset: number, volume: number = 1) {
    if (!this.settings) await this.init();
    if (!this.settings?.sound) return;
    let entry = this.sfxCache[key];
    if (!entry) {
      const { sound } = await Audio.Sound.createAsync(asset, { volume });
      entry = this.sfxCache[key] = { sound, playing: false };
    }
    const sound = entry.sound!;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  }
}

export const audio = AudioManager.get();


