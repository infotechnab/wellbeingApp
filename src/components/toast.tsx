import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { radius, spacing, usePalette } from '@/theme';

import { AppText } from './ui';

type ToastStore = {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
};

export const useToast = create<ToastStore>()((set) => ({
  message: null,
  show: (message) => set({ message }),
  hide: () => set({ message: null }),
}));

const TOAST_MS = 2800;

export function ToastHost() {
  const { message, hide } = useToast();
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, TOAST_MS);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message) return null;

  return (
    <View pointerEvents="none" style={[styles.host, { top: insets.top + spacing.md }]}>
      <Animated.View
        entering={FadeInUp}
        exiting={FadeOutUp}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[styles.toast, { backgroundColor: palette.text }]}>
        <AppText style={{ color: palette.background }}>{message}</AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.pill,
    maxWidth: 420,
  },
});
