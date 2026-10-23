import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EmotionId } from '@/content';
import { deviceStorage, newId, storageKey } from '@/storage/persist';

export type ActivityEventType =
  | 'session_start'
  | 'session_end'
  | 'start'
  | 'complete'
  | 'skip'
  | 'redo'
  | 'like'
  | 'dislike'
  | 'reaction_cleared';

export type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  sessionId: string;
  emotionId: EmotionId;
  activityId: string | null;
  at: number;
  /** Set once the event has been uploaded to the backend. */
  syncedAt?: number;
};

const MAX_EVENTS = 2000;

type TelemetryStore = {
  events: ActivityEvent[];
  record: (event: Omit<ActivityEvent, 'id' | 'at'> & { at?: number }) => void;
  markSynced: (ids: string[], at: number) => void;
};

/**
 * Local log of what users do with activities (likes, redos, skips…). It feeds preference data to
 * the backend when sync is configured, and keeps working offline.
 */
export const useTelemetryStore = create<TelemetryStore>()(
  persist(
    (set) => ({
      events: [],
      record: ({ at = Date.now(), ...event }) =>
        set((state) => ({ events: [...state.events, { ...event, at, id: newId() }].slice(-MAX_EVENTS) })),
      markSynced: (ids, at) => {
        const done = new Set(ids);
        set((state) => ({ events: state.events.map((e) => (done.has(e.id) ? { ...e, syncedAt: at } : e)) }));
      },
    }),
    { name: storageKey('telemetry'), storage: deviceStorage, version: 1 },
  ),
);
