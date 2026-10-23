import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Screen } from '@/components/ui';
import { radius, spacing, usePalette } from '@/theme';

/** International directory of free, confidential crisis lines, searchable by country. */
export const HELPLINE_DIRECTORY_URL = 'https://findahelpline.com';

export default function HelpScreen() {
  const palette = usePalette();

  return (
    <Screen scroll>
      <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
        <AppText muted>‹ Back</AppText>
      </Pressable>

      <View style={styles.content}>
        <AppText variant="title">Need help now?</AppText>
        <AppText muted>
          This app offers small everyday exercises. It can’t help in an emergency and isn’t a replacement
          for professional care.
        </AppText>

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.danger }]}>
          <AppText variant="label">If you or someone else is in immediate danger</AppText>
          <AppText>Call your local emergency number now (for example 911, 999, 112 or 000).</AppText>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <AppText variant="label">Talk to someone today</AppText>
          <AppText>
            Free, confidential helplines are available in most countries, by phone, text or chat.
          </AppText>
          <Button label="Find a helpline near you" onPress={() => Linking.openURL(HELPLINE_DIRECTORY_URL)} />
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <AppText variant="label">Reach out</AppText>
          <AppText>
            Telling a friend, family member, teacher or doctor how you feel is a strong first step.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, marginTop: spacing.lg },
  card: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
});
