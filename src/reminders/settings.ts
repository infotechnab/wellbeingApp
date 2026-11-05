import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, storageKey } from '@/storage/persist';

export type ReminderTime = { hour: number; minute: number };

/** The times offered in Profile. Kept to a few so the setting stays one tap. */
export const REMINDER_TIMES: (ReminderTime & { label: string })[] = [
  { hour: 8, minute: 0, label: '8:00 am' },
  { hour: 13, minute: 0, label: '1:00 pm' },
  { hour: 18, minute: 0, label: '6:00 pm' },
  { hour: 21, minute: 0, label: '9:00 pm' },
];

type ReminderStore = ReminderTime & {
  enabled: boolean;
  /** Notification taps already saved, so a tap seen twice (in the background and again on opening) counts once. */
  handled: string[];
  setEnabled: (enabled: boolean) => void;
  setTime: (time: ReminderTime) => void;
  /** Returns false when this tap was already handled. */
  claim: (key: string) => boolean;
};

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      enabled: false,
      hour: 21,
      minute: 0,
      handled: [],
      setEnabled: (enabled) => set({ enabled }),
      setTime: ({ hour, minute }) => set({ hour, minute }),
      claim: (key) => {
        if (get().handled.includes(key)) return false;
        set((s) => ({ handled: [key, ...s.handled].slice(0, 30) }));
        return true;
      },
    }),
    { name: storageKey('reminder'), storage: deviceStorage, version: 1 },
  ),
);
