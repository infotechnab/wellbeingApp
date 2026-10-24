import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Screen } from '@/components/ui';
import { radius, spacing, usePalette } from '@/theme';

// Nepal, where the app launches first. Checked on 24 October 2026 against WHO Nepal, Ncell's list of
// emergency numbers and findahelpline.com.
const EMERGENCY_NUMBERS = [
  { service: 'Police', number: '100' },
  { service: 'Ambulance', number: '102' },
];
/** Nepal's National Suicide Prevention Helpline, run by the government at the Mental Hospital, Lagankhel. */
const CRISIS_LINE = '1166';

/** More free, confidential helplines in Nepal, in a directory that covers other countries too. */
export const HELPLINE_DIRECTORY_URL = 'https://findahelpline.com/countries/np';

/** Opens the phone's dialler. On a device that can't call, the number stays visible on the button. */
function call(number: string) {
  Linking.openURL(`tel:${number}`).catch(() => {});
}

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
          <AppText>Call Nepal Police or an ambulance now.</AppText>
          <View style={styles.row}>
            {EMERGENCY_NUMBERS.map(({ service, number }) => (
              <Button
                key={number}
                label={`${service} ${number}`}
                kind="secondary"
                onPress={() => call(number)}
                style={styles.rowButton}
              />
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <AppText variant="label">Talk to someone today</AppText>
          <AppText>
            Trained counsellors at Nepal’s National Suicide Prevention Helpline listen and help. It’s free and
            open 24 hours.
          </AppText>
          <Button label={`Call ${CRISIS_LINE}`} onPress={() => call(CRISIS_LINE)} />
          <Button label="More helplines" kind="ghost" onPress={() => Linking.openURL(HELPLINE_DIRECTORY_URL)} />
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
  row: { flexDirection: 'row', gap: spacing.sm },
  rowButton: { flex: 1, paddingHorizontal: spacing.sm },
});
