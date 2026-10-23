import { create } from 'zustand';

import type { EmotionId } from '@/content';

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
  end: () => void;
};

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useSessionStore = create<SessionStore>()((set, get) => {
  const apply = (fn: (session: Session, now: number) => Session) => {
    const { session } = get();
    if (session) set({ session: fn(session, Date.now()) });
  };

  return {
    session: null,
    begin: (emotionId) => set({ session: createSession(emotionId, Date.now(), newId()) }),
    start: (activityId) => apply((s, now) => startActivity(s, activityId, now)),
    pause: (activityId) => apply((s, now) => pauseActivity(s, activityId, now)),
    resume: (activityId) => apply((s, now) => resumeActivity(s, activityId, now)),
    complete: (activityId) => apply((s, now) => completeActivity(s, activityId, now)),
    redo: (activityId) => apply((s, now) => redoActivity(s, activityId, now)),
    react: (activityId, reaction) => apply((s) => toggleReaction(s, activityId, reaction)),
    next: () => {
      const { session } = get();
      if (!session) return true;
      const result = advance(session, Date.now());
      set({ session: result.session });
      return result.finished;
    },
    back: () => apply((s, now) => goBack(s, now)),
    end: () => set({ session: null }),
  };
});
