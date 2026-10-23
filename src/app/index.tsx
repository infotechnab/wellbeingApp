import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SunIcon } from '@/components/icons';
import { AppText, Screen } from '@/components/ui';
import { pickAffirmation } from '@/content';
import { spacing } from '@/theme';

const WELCOME_DELAY_MS = 2800;

export default function WelcomeScreen() {
  const [affirmation] = useState(() => pickAffirmation());

  const proceed = () => router.replace('/home');

  useEffect(() => {
    const timer = setTimeout(proceed, WELCOME_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen>
      <Pressable
        style={styles.fill}
        onPress={proceed}
        accessibilityRole="button"
        accessibilityHint="Continues to the emotion wheel">
        <Animated.View entering={FadeIn.duration(700)} style={styles.content}>
          <SunIcon color="#F2B45C" size={48} />
          <AppText variant="hero" center>
            {affirmation}
          </AppText>
        </Animated.View>
        <View style={styles.hint}>
          <AppText variant="caption" muted center>
            Tap to continue
          </AppText>
        </View>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.md },
  hint: { paddingBottom: spacing.lg },
});
