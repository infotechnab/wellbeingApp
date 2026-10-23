import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EmotionId } from '@/content';
import { deviceStorage, newId, storageKey } from '@/storage/persist';
import { useTelemetryStore, type ActivityEventType } from '@/telemetry/store';

import { summarize, useHistoryStore } from './history';
import {
  advance,
  completeActivity,
  createSession,
  goBack,
  pauseActivity,
  redoActivity,
  resumeActivity,
  startActivity,
  toggleReaction,
  type Reaction,
  type Session,
} from './model';

type SessionStore = {
  session: Session | null;
  begin: (emotionId: EmotionId) => void;
  start: (activityId: string) => void;
  pause: (activityId: string) => void;
  resume: (activityId: string) => void;
  complete: (activityId: string) => void;
  redo: (activityId: string) => void;
  react: (activityId: string, reaction: Reaction) => void;
  /** Returns true when the session has run out of activities. */
  next: () => boolean;
  back: () => void;
  /** Pauses whatever is running, e.g. when the app goes to the background. */
  suspend: () => void;
  /** Saves the session to history and clears it, so the next emotion starts fresh. */
  end: () => void;
};

const track = (session: Session, type: ActivityEventType, activityId: string | null) =>
  useTelemetryStore.getState().record({ type, sessionId: session.id, emotionId: session.emotionId, activityId });

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => {
      const apply = (fn: (session: Session, now: number) => Session) => {
        const { session } = get();
        if (!session) return null;
        const updated = fn(session, Date.now());
        set({ session: updated });
        return updated;
      };

      return {
        session: null,
        begin: (emotionId) => {
          const previous = get().session;
          if (previous) get().end();
          const session = createSession(emotionId, Date.now(), newId());
          set({ session });
          track(session, 'session_start', null);
        },
        start: (activityId) => {
          const s = apply((session, now) => startActivity(session, activityId, now));
          if (s) track(s, 'start', activityId);
        },
        pause: (activityId) => apply((s, now) => pauseActivity(s, activityId, now)),
        resume: (activityId) => apply((s, now) => resumeActivity(s, activityId, now)),
        complete: (activityId) => {
          const before = get().session?.progress[activityId]?.status;
          const s = apply((session, now) => completeActivity(session, activityId, now));
          if (s && before !== 'done') track(s, 'complete', activityId);
        },
        redo: (activityId) => {
          const s = apply((session, now) => redoActivity(session, activityId, now));
          if (s) track(s, 'redo', activityId);
        },
        react: (activityId, reaction) => {
          const s = apply((session) => toggleReaction(session, activityId, reaction));
          if (s) track(s, s.progress[activityId].reaction ?? 'reaction_cleared', activityId);
        },
        next: () => {
          const { session } = get();
          if (!session) return true;
          const activityId = session.activityIds[session.index];
          const result = advance(session, Date.now());
          set({ session: { ...result.session, finished: result.finished } });
          if (result.session.progress[activityId].skipped) track(result.session, 'skip', activityId);
          return result.finished;
        },
        back: () => {
          apply((s, now) => goBack(s, now));
        },
        suspend: () => {
          const { session } = get();
          if (!session) return;
          const activityId = session.activityIds[session.index];
          if (session.progress[activityId].status === 'running') get().pause(activityId);
        },
        end: () => {
          const { session } = get();
          if (session) {
            useHistoryStore.getState().add(summarize(session, Date.now()));
            track(session, 'session_end', null);
          }
          set({ session: null });
        },
      };
    },
    {
      name: storageKey('session'),
      storage: deviceStorage,
      version: 1,
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
