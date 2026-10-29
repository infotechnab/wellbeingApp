import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EmotionId } from '@/content';
import { deviceStorage, newId, storageKey } from '@/storage/persist';
import { appVersion } from '@/utils/app-version';

/** Written feedback can be up to 200 words. */
export const FEEDBACK_MAX_WORDS = 200;
/** A hard cap for the text box, well above 200 words of ordinary length. */
export const FEEDBACK_MAX_LENGTH = 2000;
/** Voice messages can be up to 5 minutes long. */
export const VOICE_MAX_SECONDS = 5 * 60;

export type FeedbackEntry = {
  id: string;
  sessionId: string | null;
  emotionId: EmotionId | null;
  /** Empty when the feedback is only a voice message. */
  message: string;
  /** The voice message's path in the feedback-audio storage bucket, once uploaded. */
  audioPath?: string;
  audioDurationMs?: number;
  /** Which copy of the app sent it, such as "1.1.0 (build 9)" on "android". */
  appVersion?: string | null;
  platform?: string;
  createdAt: number;
  syncedAt?: number;
};

type NewFeedback = Pick<FeedbackEntry, 'sessionId' | 'emotionId' | 'message' | 'audioPath' | 'audioDurationMs'> & {
  id?: string;
};

type FeedbackStore = {
  entries: FeedbackEntry[];
  add: (entry: NewFeedback) => FeedbackEntry;
  markSynced: (ids: string[], at: number) => void;
};

export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** Returns an error message when the text is over the word limit, or null. */
export function feedbackLengthProblem(text: string): string | null {
  return countWords(text) > FEEDBACK_MAX_WORDS ? `Please keep it to ${FEEDBACK_MAX_WORDS} words.` : null;
}

/** Returns an error message, or null when the text can be submitted. */
export function validateFeedback(text: string): string | null {
  if (!text.trim()) return 'Write a few words, or tap “No thanks”.';
  return feedbackLengthProblem(text);
}

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set) => ({
      entries: [],
      add: ({ id = newId(), ...input }) => {
        const entry: FeedbackEntry = {
          ...input,
          id,
          message: input.message.trim(),
          appVersion,
          platform: Platform.OS,
          createdAt: Date.now(),
        };
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
