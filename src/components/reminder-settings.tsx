import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { allowNotifications, remindersSupported } from '@/reminders/notifications';
import { REMINDER_TIMES, useReminderStore } from '@/reminders/settings';
import { radius, spacing, usePalette } from '@/theme';

/** Profile's "Daily reminder" section: on or off, and one of a few times. */
export function ReminderSettings() {
  const palette = usePalette();
  const { enabled, hour, minute, setEnabled, setTime } = useReminderStore();
  const [blocked, setBlocked] = useState(false);

  if (!remindersSupported) {
    return (
      <AppText variant="caption" muted>
        Daily reminders are available in the Android and iPhone apps.
      </AppText>
    );
  }

  const turnOn = async () => {
    const allowed = await allowNotifications().catch(() => false);
    setBlocked(!allowed);
    if (allowed) setEnabled(true);
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" muted>
        {enabled
          ? 'Once a day we’ll ask how you’re feeling. Pick a feeling right on the notification to check in.'
          : 'Get one gentle “How are you feeling?” notification a day, and check in from it without opening the app.'}
      </AppText>
      {enabled ? (
        <View style={styles.times} accessibilityRole="radiogroup" accessibilityLabel="Reminder time">
          {REMINDER_TIMES.map((t) => {
            const picked = t.hour === hour && t.minute === minute;
            return (
              <Pressable
                key={t.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: picked }}
                onPress={() => setTime(t)}
                style={[
                  styles.time,
                  { borderColor: picked ? palette.primary : palette.border },
                  picked && { backgroundColor: palette.primarySoft },
                ]}>
                <AppText variant="caption" style={picked ? { color: palette.text, fontWeight: '600' } : undefined}>
                  {t.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {blocked ? (
        <AppText variant="caption" muted>
          Notifications are turned off for this app. You can allow them in your phone’s Settings, then try again.
        </AppText>
      ) : null}
      <Button
        label={enabled ? 'Turn off reminder' : 'Turn on daily reminder'}
        kind={enabled ? 'ghost' : 'secondary'}
        onPress={enabled ? () => setEnabled(false) : turnOn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  time: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1 },
});
