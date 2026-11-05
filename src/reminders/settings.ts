import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, storageKey } from '@/storage/persist';

export type ReminderSlot = 'morning' | 'midday' | 'evening';

/** The check-ins offered in Profile, in the order shown. Only the morning one starts switched on. */
export const REMINDER_SLOTS: { id: ReminderSlot; label: string; time: string; hour: number; minute: number; on: boolean }[] = [
  { id: 'morning', label: 'Morning check-in', time: '8:00 am', hour: 8, minute: 0, on: true },
  { id: 'midday', label: 'Midday check-in', time: '1:00 pm', hour: 13, minute: 0, on: false },
  { id: 'evening', label: 'Evening check-in', time: '8:00 pm', hour: 20, minute: 0, on: false },
];

const DEFAULT_ON = Object.fromEntries(REMINDER_SLOTS.map((s) => [s.id, s.on])) as Record<ReminderSlot, boolean>;

type ReminderStore = {
  on: Record<ReminderSlot, boolean>;
  /** Whether the app has asked for notification permission yet. It asks once, on the first visit to Home. */
  asked: boolean;
  /** Notification taps already saved, so a tap seen twice (in the background and again on opening) counts once. */
  handled: string[];
  setOn: (slot: ReminderSlot, on: boolean) => void;
  markAsked: () => void;
  /** Returns false when this tap was already handled. */
  claim: (key: string) => boolean;
};

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      on: DEFAULT_ON,
      asked: false,
      handled: [],
      setOn: (slot, on) => set((s) => ({ on: { ...s.on, [slot]: on } })),
      markAsked: () => set({ asked: true }),
      claim: (key) => {
        if (get().handled.includes(key)) return false;
        set((s) => ({ handled: [key, ...s.handled].slice(0, 30) }));
        return true;
      },
    }),
    {
      name: storageKey('reminder'),
      storage: deviceStorage,
      version: 2,
      // 1.2.0 had a single reminder, off unless turned on. Start everyone on the new defaults.
      migrate: (persisted) => {
        const old = (persisted ?? {}) as { handled?: string[] };
        return { on: DEFAULT_ON, asked: false, handled: old.handled ?? [] } as unknown as ReminderStore;
      },
    },
  ),
);
