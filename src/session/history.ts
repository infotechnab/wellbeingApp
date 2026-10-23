import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EmotionId } from '@/content';
import { deviceStorage, storageKey } from '@/storage/persist';

import type { Session } from './model';

export type SessionSummary = {
  id: string;
  emotionId: EmotionId;
  startedAt: number;
  endedAt: number;
  completed: number;
  skipped: number;
  total: number;
  redos: number;
  syncedAt?: number;
};

export function summarize(session: Session, endedAt: number): SessionSummary {
  const all = session.activityIds.map((id) => session.progress[id]);
  return {
    id: session.id,
    emotionId: session.emotionId,
    startedAt: session.startedAt,
    endedAt,
    completed: all.filter((p) => p.completions > 0).length,
    skipped: all.filter((p) => p.skipped && p.completions === 0).length,
    total: all.length,
    redos: all.reduce((sum, p) => sum + p.redoCount, 0),
  };
}

type HistoryStore = {
  sessions: SessionSummary[];
  add: (summary: SessionSummary) => void;
  /** Adds summaries downloaded from the account, skipping ones already on the device. */
  merge: (summaries: SessionSummary[]) => void;
  markSynced: (ids: string[], at: number) => void;
  clear: () => void;
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      sessions: [],
      add: (summary) =>
        set((state) => ({ sessions: [summary, ...state.sessions.filter((s) => s.id !== summary.id)].slice(0, 200) })),
      merge: (summaries) =>
        set((state) => {
          const known = new Set(state.sessions.map((s) => s.id));
          const added = summaries.filter((s) => !known.has(s.id));
          return { sessions: [...state.sessions, ...added].sort((a, b) => b.endedAt - a.endedAt).slice(0, 200) };
        }),
      markSynced: (ids, at) => {
        const done = new Set(ids);
        set((state) => ({ sessions: state.sessions.map((s) => (done.has(s.id) ? { ...s, syncedAt: at } : s)) }));
      },
      clear: () => set({ sessions: [] }),
    }),
    { name: storageKey('history'), storage: deviceStorage, version: 1 },
  ),
);
