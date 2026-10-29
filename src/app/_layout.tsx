import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useBackend } from '@/backend/use-backend';
import { ToastHost } from '@/components/toast';
import { useAppStatePause } from '@/session/use-app-state-pause';
import { useIsDark, usePalette } from '@/theme';

export default function RootLayout() {
  useAppStatePause();
  useBackend();
  const isDark = useIsDark();
  const palette = usePalette();
  const base = isDark ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider
          value={{
            ...base,
            colors: { ...base.colors, background: palette.background, card: palette.surface, primary: palette.primary },
          }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}>
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="sketch" options={{ animation: 'fade' }} />
            <Stack.Screen name="session" options={{ gestureEnabled: false }} />
            <Stack.Screen name="feedback" options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
            <Stack.Screen name="help" options={{ presentation: 'modal' }} />
            <Stack.Screen name="send-feedback" options={{ presentation: 'modal' }} />
          </Stack>
          <ToastHost />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
