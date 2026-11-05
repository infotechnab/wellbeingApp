import type { EmotionId } from '@/content';
import type { SessionSummary } from '@/session/history';

/** Shown until someone has check-ins of their own. */
export const DEFAULT_QUICK_FEELINGS: EmotionId[] = ['joy', 'sadness'];

/**
 * The feelings offered as buttons on the reminder: the ones picked most often, the more recent one first on a
 * tie, topped up with the defaults. "Not sure" is left out, since the "Other feeling" button covers it.
 */
export function pickQuickFeelings(sessions: Pick<SessionSummary, 'emotionId' | 'endedAt'>[], count = 2): EmotionId[] {
  const tally = new Map<EmotionId, { count: number; last: number }>();
  for (const s of sessions) {
    if (s.emotionId === 'confused') continue;
    const t = tally.get(s.emotionId) ?? { count: 0, last: 0 };
    tally.set(s.emotionId, { count: t.count + 1, last: Math.max(t.last, s.endedAt) });
  }
  const ranked = [...tally.entries()].sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last).map(([id]) => id);
  for (const id of DEFAULT_QUICK_FEELINGS) if (!ranked.includes(id)) ranked.push(id);
  return ranked.slice(0, count);
}
