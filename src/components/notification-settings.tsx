import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui';
import { allowNotifications, remindersSupported } from '@/reminders/notifications';
import { REMINDER_SLOTS, useReminderStore, type ReminderSlot } from '@/reminders/settings';
import { spacing, usePalette } from '@/theme';

/** Profile's "Notifications" section: a switch for each daily check-in. */
export function NotificationSettings() {
  const palette = usePalette();
  const on = useReminderStore((s) => s.on);
  const setOn = useReminderStore((s) => s.setOn);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!remindersSupported) return;
    Notifications.getPermissionsAsync()
      .then((p) => setAllowed(p.granted))
      .catch(() => setAllowed(null));
  }, []);

  if (!remindersSupported) {
    return (
      <AppText variant="caption" muted>
        Check-in notifications are available in the Android and iPhone apps.
      </AppText>
    );
  }

  const toggle = async (slot: ReminderSlot, value: boolean) => {
    if (!value) {
      setOn(slot, false);
      return;
    }
    const ok = await allowNotifications().catch(() => false);
    setAllowed(ok);
    if (ok) setOn(slot, true);
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" muted>
        We’ll ask how you’re feeling. Tap a feeling right on the notification to check in.
      </AppText>
      {REMINDER_SLOTS.map((slot) => (
        <View key={slot.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText>{slot.label}</AppText>
            <AppText variant="caption" muted>
              {slot.time}
            </AppText>
          </View>
          <Switch
            accessibilityLabel={`${slot.label}, ${slot.time}`}
            value={on[slot.id] && allowed !== false}
            onValueChange={(value) => void toggle(slot.id, value)}
            trackColor={{ false: palette.border, true: palette.primary }}
            thumbColor={palette.surface}
            ios_backgroundColor={palette.border}
          />
        </View>
      ))}
      {allowed === false ? (
        <AppText variant="caption" muted>
          Notifications are turned off for this app. To get check-ins, allow them in your phone’s Settings.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
});
