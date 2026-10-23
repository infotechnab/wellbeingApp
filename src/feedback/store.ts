import { create } from 'zustand';

import type { EmotionId } from '@/content';

export const FEEDBACK_MAX_LENGTH = 1000;

export type FeedbackEntry = {
  id: string;
  sessionId: string | null;
  emotionId: EmotionId | null;
  message: string;
  createdAt: number;
};

type FeedbackStore = {
  entries: FeedbackEntry[];
  add: (entry: Omit<FeedbackEntry, 'id' | 'createdAt'>) => FeedbackEntry;
};

/** Returns an error message, or null when the text can be submitted. */
export function validateFeedback(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return 'Write a few words, or tap “No thanks”.';
  if (trimmed.length > FEEDBACK_MAX_LENGTH) return `Please keep it under ${FEEDBACK_MAX_LENGTH} characters.`;
  return null;
}

export const useFeedbackStore = create<FeedbackStore>()((set) => ({
  entries: [],
  add: (input) => {
    const entry: FeedbackEntry = {
      ...input,
      message: input.message.trim(),
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    set((state) => ({ entries: [entry, ...state.entries] }));
    return entry;
  },
}));
