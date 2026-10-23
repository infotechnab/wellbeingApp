export type Palette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  danger: string;
  success: string;
};

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    surfaceMuted: '#F1EEE9',
    border: '#E2DDD5',
    text: '#2F3437',
    textMuted: '#6B7175',
    primary: '#5B9BB5',
    primarySoft: '#DCEEF4',
    onPrimary: '#FFFFFF',
    danger: '#C9675B',
    success: '#5E9E7E',
  },
  dark: {
    background: '#16191C',
    surface: '#1F2327',
    surfaceMuted: '#272C31',
    border: '#353B41',
    text: '#ECEDEE',
    textMuted: '#A3A9AE',
    primary: '#7DB8CF',
    primarySoft: '#23394A',
    onPrimary: '#10181D',
    danger: '#E08A7F',
    success: '#83C2A2',
  },
};
