import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EmotionId } from '@/content';
import { deviceStorage, newId, storageKey } from '@/storage/persist';

export const FEEDBACK_MAX_LENGTH = 1000;

export type FeedbackEntry = {
  id: string;
  sessionId: string | null;
  emotionId: EmotionId | null;
  message: string;
  createdAt: number;
  syncedAt?: number;
};

type FeedbackStore = {
  entries: FeedbackEntry[];
  add: (entry: Omit<FeedbackEntry, 'id' | 'createdAt' | 'syncedAt'>) => FeedbackEntry;
  markSynced: (ids: string[], at: number) => void;
};

/** Returns an error message, or null when the text can be submitted. */
export function validateFeedback(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return 'Write a few words, or tap “No thanks”.';
  if (trimmed.length > FEEDBACK_MAX_LENGTH) return `Please keep it under ${FEEDBACK_MAX_LENGTH} characters.`;
  return null;
}

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set) => ({
      entries: [],
      add: (input) => {
        const entry: FeedbackEntry = { ...input, message: input.message.trim(), id: newId(), createdAt: Date.now() };
        set((state) => ({ entries: [entry, ...state.entries] }));
        return entry;
      },
      markSynced: (ids, at) => {
        const done = new Set(ids);
        set((state) => ({ entries: state.entries.map((e) => (done.has(e.id) ? { ...e, syncedAt: at } : e)) }));
      },
    }),
    { name: storageKey('feedback'), storage: deviceStorage, version: 1 },
  ),
);
