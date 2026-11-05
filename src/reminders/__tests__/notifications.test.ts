import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { useHistoryStore } from '@/session/history';

import { askOnceForReminders, categoryFor, feelingFromAction, handleReminderResponse, syncReminder } from '../notifications';
import { useReminderStore } from '../settings';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 5 },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  setNotificationCategoryAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  dismissNotificationAsync: jest.fn(async () => undefined),
}));

const response = (actionIdentifier: string, data: object, date = 1000) =>
  ({
    actionIdentifier,
    notification: { date, request: { identifier: 'daily_checkin', content: { data } } },
  }) as unknown as Notifications.NotificationResponse;

beforeAll(() => {
  Platform.OS = 'android';
});

beforeEach(() => {
  jest.clearAllMocks();
  useHistoryStore.setState({ sessions: [] });
  useReminderStore.setState({ on: { morning: true, midday: false, evening: false }, asked: false, handled: [] });
});

it('reads the feeling from a button id', () => {
  expect(feelingFromAction('feel_sadness')).toBe('sadness');
  expect(feelingFromAction('feel_nope')).toBeNull();
  expect(feelingFromAction('other')).toBeNull();
  expect(categoryFor(['joy', 'sadness'])).toBe('checkin_joy_sadness');
});

it('saves a feeling button as a quick check-in, once, and shows a saved note', async () => {
  const tap = response('feel_sadness', { kind: 'checkin' });
  expect(await handleReminderResponse(tap)).toBeNull();
  expect(await handleReminderResponse(tap)).toBeNull();

  const sessions = useHistoryStore.getState().sessions;
  expect(sessions).toHaveLength(1);
  expect(sessions[0]).toMatchObject({ emotionId: 'sadness', total: 0, completed: 0 });
  expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith('daily_checkin');
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
    expect.objectContaining({
      content: expect.objectContaining({ title: 'Check-in saved', data: { kind: 'saved', emotionId: 'sadness' } }),
    }),
  );
});

it('saves the next day’s tap too', async () => {
  await handleReminderResponse(response('feel_joy', { kind: 'checkin' }, 1000));
  await handleReminderResponse(response('feel_joy', { kind: 'checkin' }, 2000));
  expect(useHistoryStore.getState().sessions).toHaveLength(2);
});

it('opens the wheel for "Other feeling" and an activity for the saved note', async () => {
  expect(await handleReminderResponse(response('other', { kind: 'checkin' }))).toEqual({ to: 'home' });
  expect(await handleReminderResponse(response('default', { kind: 'saved', emotionId: 'fear' }, 3000))).toEqual({
    to: 'session',
    emotionId: 'fear',
  });
  expect(useHistoryStore.getState().sessions).toHaveLength(0);
});

it('ignores notifications that are not reminders', async () => {
  expect(await handleReminderResponse(response('feel_joy', {}))).toBeNull();
  expect(useHistoryStore.getState().sessions).toHaveLength(0);
});

const scheduledTimes = () =>
  (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(([req]) => [req.identifier, req.trigger.hour]);

it('schedules only the morning check-in by default', async () => {
  await syncReminder();
  expect(scheduledTimes()).toEqual([['checkin_morning', 8]]);
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('daily_checkin');
});

it('schedules each check-in that is switched on, and none when all are off', async () => {
  useReminderStore.getState().setOn('morning', false);
  useReminderStore.getState().setOn('midday', true);
  useReminderStore.getState().setOn('evening', true);
  await syncReminder();
  expect(scheduledTimes()).toEqual([
    ['checkin_midday', 13],
    ['checkin_evening', 20],
  ]);

  jest.clearAllMocks();
  useReminderStore.getState().setOn('midday', false);
  useReminderStore.getState().setOn('evening', false);
  await syncReminder();
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

it('asks for permission only once', async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false, canAskAgain: true });
  await askOnceForReminders();
  await askOnceForReminders();
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(useReminderStore.getState().asked).toBe(true);
});
