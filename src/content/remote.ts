import { ACTIVITIES } from './activities';
import { AFFIRMATIONS } from './affirmations';
import { EMOTIONS, WHEEL_ORDER } from './emotions';
import type { Activity, ActivityKind, EmotionId } from './types';

/** Content as stored in Supabase (snake_case rows). */
export type RemoteContent = {
  emotions: {
    id: string;
    name: string;
    theme: string;
    need: string;
    body_response: string;
  }[];
  activities: {
    id: string;
    emotion_id: string;
    sort_order: number;
    kind: string;
    title: string;
    instruction: string;
    duration_sec: number | null;
    breath: Activity['breath'] | null;
    steps: string[] | null;
    templates: string[] | null;
    placeholder: string | null;
    research: string | null;
  }[];
  affirmations: { text: string }[];
};

const KINDS: ActivityKind[] = ['breath', 'timer', 'prompt', 'share', 'write', 'grounding', 'focus-dot'];
const EMOTION_IDS = new Set<string>([...WHEEL_ORDER, 'confused']);

function toActivity(row: RemoteContent['activities'][number]): Activity | null {
  if (!EMOTION_IDS.has(row.emotion_id) || !KINDS.includes(row.kind as ActivityKind)) return null;
  const activity: Activity = {
    id: row.id,
    emotionId: row.emotion_id as EmotionId,
    kind: row.kind as ActivityKind,
    title: row.title,
    instruction: row.instruction,
    durationSec: row.duration_sec ?? undefined,
    breath: row.breath ?? undefined,
    steps: row.steps ?? undefined,
    templates: row.templates ?? undefined,
    placeholder: row.placeholder ?? undefined,
    research: row.research ?? undefined,
  };
  const ok =
    (activity.kind === 'breath' && !!activity.breath) ||
    (['timer', 'prompt', 'focus-dot'].includes(activity.kind) && (activity.durationSec ?? 0) > 0) ||
    (activity.kind === 'grounding' && (activity.steps?.length ?? 0) > 0) ||
    (activity.kind === 'share' && (activity.templates?.length ?? 0) > 0) ||
    activity.kind === 'write';
  return ok ? activity : null;
}

/**
 * Turns remote rows into app content. Returns null when the data is incomplete (an emotion with no
 * valid activities, or no affirmations), so the app keeps its bundled content instead.
 */
export function parseRemoteContent(remote: RemoteContent): {
  activities: Activity[];
  affirmations: string[];
  emotionText: RemoteContent['emotions'];
} | null {
  const sorted = [...remote.activities].sort((a, b) => a.sort_order - b.sort_order);
  const activities = sorted.map(toActivity).filter((a): a is Activity => a !== null);
  const covered = new Set(activities.map((a) => a.emotionId));
  if ([...EMOTION_IDS].some((id) => !covered.has(id as EmotionId))) return null;

  const affirmations = remote.affirmations.map((a) => a.text.trim()).filter(Boolean);
  if (affirmations.length === 0) return null;

  return { activities, affirmations, emotionText: remote.emotions.filter((e) => EMOTION_IDS.has(e.id)) };
}

/** Replaces the in-memory content the app reads from. Colours and wheel order stay local. */
export function applyContent(content: NonNullable<ReturnType<typeof parseRemoteContent>>) {
  ACTIVITIES.splice(0, ACTIVITIES.length, ...content.activities);
  AFFIRMATIONS.splice(0, AFFIRMATIONS.length, ...content.affirmations);
  for (const row of content.emotionText) {
    Object.assign(EMOTIONS[row.id as EmotionId], {
      name: row.name,
      theme: row.theme,
      need: row.need,
      bodyResponse: row.body_response,
    });
  }
}
