import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText, Screen } from '@/components/ui';

const WELCOME_DELAY_MS = 2500;

export default function WelcomeScreen() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace('/home'), WELCOME_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen>
      <Pressable style={styles.fill} onPress={() => router.replace('/home')} accessibilityRole="button">
        <AppText variant="hero" center>
          Welcome
        </AppText>
        <AppText muted center>
          Tap to continue
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});
