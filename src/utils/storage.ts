import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_SETTINGS = 'pk_settings_v1';
const KEY_HISCORES = 'pk_hiscores_v1';

export type Settings = {
  sound: boolean;
  music: boolean;
  haptics: boolean;
  lastDifficulty?: string;
  onboarded?: boolean;
};
export type Highscore = { mode: string; score: number; timestamp: number };

export async function loadSettings(): Promise<Settings> {
  try {
    const s = await AsyncStorage.getItem(KEY_SETTINGS);
    const defaults: Settings = { sound: true, music: true, haptics: true, onboarded: false };
    return s ? { ...defaults, ...JSON.parse(s) } : defaults;
  } catch {
    return { sound: true, music: true, haptics: true, onboarded: false };
  }
}
export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
}

export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const next = { ...current, ...partial };
  await saveSettings(next);
  return next;
}

export async function loadHighscores(): Promise<Highscore[]> {
  try { const s = await AsyncStorage.getItem(KEY_HISCORES); return s ? JSON.parse(s) : []; } catch { return []; }
}
export async function submitHighscore(h: Highscore): Promise<void> {
  const all = await loadHighscores();
  all.push(h);
  all.sort((a,b) => b.score - a.score);
  await AsyncStorage.setItem(KEY_HISCORES, JSON.stringify(all.slice(0, 50)));
}
