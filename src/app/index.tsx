import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SunIcon } from '@/components/icons';
import { AppText, Screen } from '@/components/ui';
import { pickAffirmation } from '@/content';
import { useHydrated } from '@/hooks/use-hydrated';
import { useSessionStore } from '@/session/store';
import { spacing } from '@/theme';

const WELCOME_DELAY_MS = 2800;

/** Where to go after the welcome screen: back into an unfinished session, or to the wheel. */
function nextRoute() {
  const session = useSessionStore.getState().session;
  if (session?.finished) return '/feedback' as const;
  if (session) return '/session' as const;
  return '/home' as const;
}

export default function WelcomeScreen() {
  const [affirmation] = useState(() => pickAffirmation());
  const hydrated = useHydrated(useSessionStore);

  const proceed = () => {
    if (hydrated) router.replace(nextRoute());
  };

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => router.replace(nextRoute()), WELCOME_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hydrated]);

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
