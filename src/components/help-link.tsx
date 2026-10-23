import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { usePalette } from '@/theme';

import { AppText } from './ui';

export function HelpLink() {
  const palette = usePalette();
  return (
    <Pressable accessibilityRole="link" hitSlop={12} onPress={() => router.push('/help')}>
      <AppText variant="caption" style={{ color: palette.primary, fontWeight: '600' }}>
        Need help now?
      </AppText>
    </Pressable>
  );
}
