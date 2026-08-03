export * from '../utils/aqiDesignTokens';

export type VisualThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'mtyRespiraThemeMode';

export const VISUAL_TOKENS = {
  light: {
    background: '#f4f1ea',
    surface: '#fffdf8',
    surfaceMuted: '#e7eee8',
    border: '#d5ded6',
    text: '#1f302c',
    mutedText: '#64756d',
    accent: '#2f6f62',
    accentSoft: '#dcebe3',
    focus: '#b86b35',
    disabled: '#a8b2ad',
    shadow: 'rgba(31, 48, 44, 0.12)',
    radius: '1.25rem',
  },
  dark: {
    background: '#17211f',
    surface: '#202d29',
    surfaceMuted: '#293a34',
    border: '#40544d',
    text: '#f0f4ee',
    mutedText: '#b6c3bb',
    accent: '#8bc8a7',
    accentSoft: '#28493c',
    focus: '#f0a76d',
    disabled: '#6f7d75',
    shadow: 'rgba(0, 0, 0, 0.32)',
    radius: '1.25rem',
  },
} as const;
