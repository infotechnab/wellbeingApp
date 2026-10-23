import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { SunIcon } from '@/components/icons';
import { AppText, Button, Screen } from '@/components/ui';
import { EmotionChips } from '@/components/wheel/emotion-chips';
import { EmotionWheel } from '@/components/wheel/emotion-wheel';
import { EMOTIONS, type EmotionId } from '@/content';
import { useScreenReaderEnabled } from '@/hooks/use-screen-reader';
import { useSessionStore } from '@/session/store';
import { maxContentWidth, spacing } from '@/theme';

export default function HomeScreen() {
  const [selected, setSelected] = useState<EmotionId | null>(null);
  const begin = useSessionStore((s) => s.begin);
  // React Native Web reports a screen reader too eagerly, so the chip list is a native-only fallback.
  const screenReader = useScreenReaderEnabled() && Platform.OS !== 'web';
  const { width, height } = useWindowDimensions();
  const wheelSize = Math.min(width, maxContentWidth) - spacing.lg * 2;
  const size = Math.min(wheelSize, height * 0.48, 380);

  const choose = () => {
    if (!selected) return;
    begin(selected);
    setSelected(null);
    router.push('/session');
  };

  return (
    <Screen edges={['top']} scroll>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="title">Hello!</AppText>
          <AppText variant="lead" muted>
            How are you feeling right now?
          </AppText>
        </View>
        <SunIcon color="#F2B45C" />
      </View>

      <View style={styles.wheel}>
        {screenReader ? (
          <EmotionChips selected={selected} onSelect={setSelected} />
        ) : (
          <EmotionWheel size={size} selected={selected} onSelect={setSelected} />
        )}
      </View>

      <View style={styles.footer}>
        <AppText center muted style={styles.theme}>
          {selected ? `“${EMOTIONS[selected].theme}”` : 'Tap the feeling that fits best. There are no wrong answers.'}
        </AppText>
        <Button
          label={selected ? `Choose ${EMOTIONS[selected].name}` : 'Choose My Emotion'}
          kind="secondary"
          disabled={!selected}
          onPress={choose}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  wheel: { flex: 1, justifyContent: 'center', paddingVertical: spacing.lg },
  footer: { gap: spacing.md, paddingBottom: spacing.md },
  theme: { minHeight: 48 },
});
