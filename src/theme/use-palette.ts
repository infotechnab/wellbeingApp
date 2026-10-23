import { useColorScheme } from 'react-native';

import { palettes, type Palette } from './colors';

export function usePalette(): Palette {
  const scheme = useColorScheme();
  return palettes[scheme === 'dark' ? 'dark' : 'light'];
}

export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}
