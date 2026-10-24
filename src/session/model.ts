import { activityDurationSec, getActivitiesForEmotion, getActivity, type EmotionId } from '@/content';

export type Reaction = 'like' | 'dislike';

export type ActivityStatus = 'idle' | 'running' | 'paused' | 'done';

export type ActivityProgress = {
  status: ActivityStatus;
  /** Wall-clock ms when the current run (re)started; set only while running. */
  runningSince?: number;
  /** Time already spent in this run before the current `runningSince`. */
  elapsedMs: number;
  /** Number of times the user pressed Redo. Unlimited, but counted. */
  redoCount: number;
  completions: number;
  skipped: boolean;
  reaction?: Reaction;
};

export type Session = {
  id: string;
  emotionId: EmotionId;
  activityIds: string[];
  index: number;
  startedAt: number;
  progress: Record<string, ActivityProgress>;
  /** True once the user has moved past the last activity (they are on the feedback screen). */
  finished?: boolean;
};

export const emptyProgress = (): ActivityProgress => ({
  status: 'idle',
  elapsedMs: 0,
  redoCount: 0,
  completions: 0,
  skipped: false,
});

export function createSession(emotionId: EmotionId, now: number, id: string): Session {
  const activityIds = getActivitiesForEmotion(emotionId).map((activity) => activity.id);
  return {
    id,
    emotionId,
    activityIds,
    index: 0,
    startedAt: now,
    progress: Object.fromEntries(activityIds.map((activityId) => [activityId, emptyProgress()])),
  };
}

export function elapsedMs(progress: ActivityProgress, now: number): number {
  if (progress.status === 'running' && progress.runningSince !== undefined) {
    return progress.elapsedMs + Math.max(0, now - progress.runningSince);
  }
  return progress.elapsedMs;
}

/** Remaining whole seconds for a timed activity, or undefined when the activity is untimed. */
export function remainingSec(activityId: string, progress: ActivityProgress, now: number): number | undefined {
  const total = durationFor(activityId);
  if (total === undefined) return undefined;
  if (progress.status === 'done') return 0;
  return Math.max(0, Math.ceil(total - elapsedMs(progress, now) / 1000));
}

export function durationFor(activityId: string): number | undefined {
  const activity = getActivity(activityId);
  return activity ? activityDurationSec(activity) : undefined;
}

function update(session: Session, activityId: string, patch: (p: ActivityProgress) => ActivityProgress): Session {
  const current = session.progress[activityId] ?? emptyProgress();
  return { ...session, progress: { ...session.progress, [activityId]: patch(current) } };
}

export function startActivity(session: Session, activityId: string, now: number): Session {
  return update(session, activityId, (p) => ({ ...p, status: 'running', runningSince: now, elapsedMs: 0, skipped: false }));
}

export function pauseActivity(session: Session, activityId: string, now: number): Session {
  return update(session, activityId, (p) =>
    p.status === 'running' ? { ...p, status: 'paused', elapsedMs: elapsedMs(p, now), runningSince: undefined } : p,
  );
}

export function resumeActivity(session: Session, activityId: string, now: number): Session {
  return update(session, activityId, (p) => (p.status === 'paused' ? { ...p, status: 'running', runningSince: now } : p));
}

export function completeActivity(session: Session, activityId: string, now: number): Session {
  return update(session, activityId, (p) =>
    p.status === 'done'
      ? p
      : { ...p, status: 'done', elapsedMs: elapsedMs(p, now), runningSince: undefined, completions: p.completions + 1 },
  );
}

export function redoActivity(session: Session, activityId: string, now: number): Session {
  return update(session, activityId, (p) => ({
    ...p,
    status: 'running',
    runningSince: now,
    elapsedMs: 0,
    redoCount: p.redoCount + 1,
  }));
}

/** Tapping the active reaction again clears it; tapping the other one switches. */
export function toggleReaction(session: Session, activityId: string, reaction: Reaction): Session {
  return update(session, activityId, (p) => ({ ...p, reaction: p.reaction === reaction ? undefined : reaction }));
}

/**
 * Moves to the next activity. A running or untouched activity counts as skipped.
 * Returns `finished: true` when the user moved past the last activity.
 */
export function advance(session: Session, now: number): { session: Session; finished: boolean } {
  const activityId = session.activityIds[session.index];
  let next = pauseActivity(session, activityId, now);
  if (next.progress[activityId].status !== 'done') {
    next = update(next, activityId, (p) => ({ ...p, skipped: true }));
  }
  if (next.index >= next.activityIds.length - 1) {
    return { session: next, finished: true };
  }
  return { session: { ...next, index: next.index + 1 }, finished: false };
}

export function goBack(session: Session, now: number): Session {
  if (session.index === 0) return session;
  const paused = pauseActivity(session, session.activityIds[session.index], now);
  return { ...paused, index: session.index - 1 };
}

/** False until the user starts the first activity, skips it or moves past it. */
export function hasBegun(session: Session): boolean {
  const first = session.progress[session.activityIds[0]] ?? emptyProgress();
  return session.index > 0 || first.status !== 'idle' || first.skipped;
}
