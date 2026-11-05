import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { EMOTIONS, type EmotionId } from '@/content';
import { useHistoryStore } from '@/session/history';

import { saveQuickCheckIn } from './check-in';
import { whenHydrated } from './hydrate';
import { pickQuickFeelings } from './quick-feelings';
import { useReminderStore } from './settings';

/** Reminders only exist in the phone apps. */
export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const CHANNEL = 'reminders';
const REMINDER_ID = 'daily_checkin';
const FEEL_PREFIX = 'feel_';
export const OTHER_ACTION = 'other';

type ReminderData = { kind: 'checkin' } | { kind: 'saved'; emotionId: EmotionId };

/** Where the app should go after a notification tap that opened it. */
export type ReminderRoute = { to: 'home' } | { to: 'session'; emotionId: EmotionId } | null;

export const categoryFor = (feelings: EmotionId[]) => `checkin_${feelings.join('_')}`;

export function feelingFromAction(actionIdentifier: string): EmotionId | null {
  if (!actionIdentifier.startsWith(FEEL_PREFIX)) return null;
  const id = actionIdentifier.slice(FEEL_PREFIX.length);
  return id in EMOTIONS ? (id as EmotionId) : null;
}

export async function configureNotifications(): Promise<void> {
  if (!remindersSupported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Daily check-in',
      importance: AndroidImportance.DEFAULT,
    });
  }
}

/** Asks once for permission to show notifications. Returns whether they are allowed. */
export async function allowNotifications(): Promise<boolean> {
  if (!remindersSupported) return false;
  await configureNotifications();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Schedules (or cancels) the daily "How are you feeling?" reminder to match the settings. The two feeling
 * buttons are the person's most-picked feelings, so this runs again after each check-in.
 */
export async function syncReminder(): Promise<void> {
  if (!remindersSupported) return;
  await Promise.all([whenHydrated(useReminderStore), whenHydrated(useHistoryStore)]);
  const { enabled, hour, minute } = useReminderStore.getState();
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
  if (!enabled) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  const feelings = pickQuickFeelings(useHistoryStore.getState().sessions);
  const category = categoryFor(feelings);
  await Notifications.setNotificationCategoryAsync(category, [
    ...feelings.map((id) => ({
      identifier: `${FEEL_PREFIX}${id}`,
      buttonTitle: EMOTIONS[id].name,
      options: { opensAppToForeground: false },
    })),
    { identifier: OTHER_ACTION, buttonTitle: 'Other feeling', options: { opensAppToForeground: true } },
  ]);
  const data: ReminderData = { kind: 'checkin' };
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'How are you feeling right now?',
      body: Platform.OS === 'ios' ? 'Press and hold to check in.' : 'Pick one below. It only takes a second.',
      categoryIdentifier: category,
      data,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
  });
}

/**
 * Handles a tap on a reminder or on its "saved" note. A feeling button saves the check-in without opening the
 * app and swaps the reminder for a quiet "saved" note. Returns where to go when the tap opened the app.
 */
export async function handleReminderResponse(response: Notifications.NotificationResponse): Promise<ReminderRoute> {
  const { notification, actionIdentifier } = response;
  const data = notification.request.content.data as Partial<ReminderData> | undefined;
  if (data?.kind !== 'saved' && data?.kind !== 'checkin') return null;

  await whenHydrated(useReminderStore);
  // The same tap can arrive twice, for example in the background and again when the app next opens.
  if (!useReminderStore.getState().claim(`${notification.request.identifier}@${notification.date}:${actionIdentifier}`)) {
    return null;
  }
  if (data.kind === 'saved') {
    return data.emotionId && data.emotionId in EMOTIONS ? { to: 'session', emotionId: data.emotionId } : null;
  }
  const emotionId = feelingFromAction(actionIdentifier);
  if (!emotionId) return { to: 'home' };

  await saveQuickCheckIn(emotionId);
  await Notifications.dismissNotificationAsync(notification.request.identifier).catch(() => undefined);
  const saved: ReminderData = { kind: 'saved', emotionId };
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check-in saved',
      body: `You picked ${EMOTIONS[emotionId].name}. Tap for a 2-minute activity.`,
      data: saved,
    },
    trigger: Platform.OS === 'android' ? { channelId: CHANNEL } : null,
  }).catch(() => undefined);
  await syncReminder().catch(() => undefined);
  return null;
}
