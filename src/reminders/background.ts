import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { handleReminderResponse } from './notifications';

/**
 * Feeling buttons on the reminder don't open the app. On Android their taps reach this background task; on
 * iPhone (and on Android while the app is open) they reach the response listener below, and any tap missed while the app was asleep is picked up the
 * next time it opens (see use-reminders). This file is loaded from the app's entry point, before any screen.
 */
export const REMINDER_TASK = 'wellbeing_reminder_response';

if (Platform.OS === 'android' || Platform.OS === 'ios') {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(REMINDER_TASK, async ({ data }) => {
    if (data && 'actionIdentifier' in data) await handleReminderResponse(data).catch(() => undefined);
  });
  if (Platform.OS === 'android') Notifications.registerTaskAsync(REMINDER_TASK).catch(() => undefined);

  Notifications.addNotificationResponseReceivedListener((response) => {
    // Feeling buttons are saved here, even with no screen showing. Taps that open the app are routed by use-reminders.
    if (response.actionIdentifier.startsWith('feel_')) {
      void handleReminderResponse(response).catch(() => undefined);
    }
  });
}
