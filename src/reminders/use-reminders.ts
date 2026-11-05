import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { useSessionStore } from '@/session/store';

import { configureNotifications, handleReminderResponse, remindersSupported, syncReminder, type ReminderRoute } from './notifications';
import { useReminderStore } from './settings';

function go(route: ReminderRoute) {
  if (!route) return;
  if (route.to === 'home') {
    router.navigate('/home');
  } else {
    useSessionStore.getState().begin(route.emotionId);
    router.push('/session');
  }
}

/** Keeps the daily reminder scheduled and opens the right screen after a tap on a reminder notification. */
export function useReminders() {
  useEffect(() => {
    if (!remindersSupported) return;
    void configureNotifications()
      .then(syncReminder)
      .catch(() => undefined);

    // A tap that started or woke the app. Feeling buttons already saved are skipped by handleReminderResponse.
    void Notifications.getLastNotificationResponseAsync()
      .then(async (last) => {
        if (!last) return;
        await Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
        go(await handleReminderResponse(last));
      })
      .catch(() => undefined);

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.actionIdentifier.startsWith('feel_')) return; // saved by the listener in background.ts
      void handleReminderResponse(response)
        .then(go)
        .catch(() => undefined);
    });

    const unsubSettings = useReminderStore.subscribe((state, prev) => {
      if (state.on !== prev.on) {
        void syncReminder().catch(() => undefined);
      }
    });
    return () => {
      sub.remove();
      unsubSettings();
    };
  }, []);
}
