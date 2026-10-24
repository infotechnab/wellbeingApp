import { activityDurationSec, type Activity } from './types';

/** Poses the animated guide can take. Each is drawn by `components/activity/guide`. */
export type PoseId =
  | 'stand'
  | 'breathe-in'
  | 'breathe-hold'
  | 'breathe-out'
  | 'belly-in'
  | 'belly-out'
  | 'heart-in'
  | 'heart-out'
  | 'fists-tight'
  | 'fists-open'
  | 'nose-in'
  | 'blow-out'
  | 'smile'
  | 'soft-shoulders'
  | 'soft-smile'
  | 'soft-eyes'
  | 'soft-gaze'
  | 'eyes-closed'
  | 'dream'
  | 'dream-happy'
  | 'look-left'
  | 'look-right'
  | 'look-up'
  | 'look-around'
  | 'feet-flat'
  | 'feet-press'
  | 'hug-cross'
  | 'hug'
  | 'hug-squeeze'
  | 'sway'
  | 'rock'
  | 'step-back-1'
  | 'step-back-2'
  | 'loose-hands'
  | 'shake-hands'
  | 'wall-ready'
  | 'wall-push'
  | 'wall-release'
  | 'think'
  | 'boundary'
  | 'hand-on-heart'
  | 'remember'
  | 'appreciate'
  | 'point'
  | 'one-finger'
  | 'listen'
  | 'touch'
  | 'phone'
  | 'phone-type'
  | 'phone-send'
  | 'write'
  | 'done';

/** Small pictures shown in the guide's thought bubble. */
export type BubbleIcon = 'words' | 'heart' | 'star' | 'check' | 'people' | 'question' | 'one' | 'eye' | 'hand' | 'ear';

/** One thing to do: a short cue under the animation, the pose that shows it, and an optional thought. */
export type GuideBeat = { cue: string; pose: PoseId; bubble?: BubbleIcon };

export type GuideStep = GuideBeat & { seconds: number };

/**
 * How an activity is demonstrated. A breathing guide follows the activity's breath pattern; a step
 * guide plays its steps in order. Step seconds add up to the activity's length (for untimed
 * activities they only pace the preview).
 */
export type Guide =
  | { kind: 'breath'; inhale: GuideBeat; hold?: GuideBeat; exhale: GuideBeat }
  | { kind: 'steps'; steps: GuideStep[] };

const step = (cue: string, seconds: number, pose: PoseId, bubble?: BubbleIcon): GuideStep => ({ cue, seconds, pose, bubble });

const breathing = (inhale: GuideBeat, exhale: GuideBeat): Guide => ({ kind: 'breath', inhale, exhale });

/** Guides for the Beta activities, keyed by activity id. Grounding guides come from the checklist itself. */
const GUIDES: Record<string, Guide> = {
  'joy-savoring-breath': breathing(
    { cue: 'Breathe in slowly', pose: 'belly-in' },
    { cue: 'Notice something pleasant', pose: 'belly-out' },
  ),
  'joy-share-moment': {
    kind: 'steps',
    steps: [step('Pick a message', 3, 'phone'), step('Make it yours', 3, 'phone-type'), step('Share it', 3, 'phone-send')],
  },
  'joy-share-energy': {
    kind: 'steps',
    steps: [
      step('Look around you', 8, 'look-around'),
      step('Choose someone or something', 8, 'point'),
      step('Silently appreciate them', 14, 'appreciate'),
    ],
  },
  'joy-smile-relaxation': {
    kind: 'steps',
    steps: [step('Gently smile', 6, 'smile'), step('Soften your shoulders', 7, 'soft-shoulders'), step('Keep the soft smile', 7, 'soft-smile')],
  },

  'trust-hand-on-heart': breathing({ cue: 'Breathe in', pose: 'heart-in' }, { cue: 'Breathe out slowly', pose: 'heart-out' }),
  'trust-connection-recall': {
    kind: 'steps',
    steps: [
      step('Close your eyes', 5, 'eyes-closed'),
      step('Think of someone who supports you', 15, 'think', 'people'),
      step('Recall a moment with them', 25, 'remember', 'heart'),
    ],
  },
  'trust-eye-softening': {
    kind: 'steps',
    steps: [step('Relax your eyes', 6, 'soft-eyes'), step('Let your gaze go soft', 14, 'soft-gaze')],
  },

  'fear-long-exhale': breathing({ cue: 'Breathe in', pose: 'breathe-in' }, { cue: 'Long, slow breath out', pose: 'breathe-out' }),
  'fear-foot-press': {
    kind: 'steps',
    steps: [step('Feet flat on the floor', 3, 'feet-flat'), step('Press down firmly', 9, 'feet-press'), step('Slowly release', 3, 'stand')],
  },

  'surprise-orienting': {
    kind: 'steps',
    steps: [
      step('Slowly look to the left', 8, 'look-left'),
      step('Now slowly to the right', 8, 'look-right'),
      step('Look up and around', 7, 'look-up'),
      step('Come back to the middle', 7, 'stand'),
    ],
  },
  'surprise-three-breaths': breathing({ cue: 'Breathe in', pose: 'breathe-in' }, { cue: 'Breathe out', pose: 'breathe-out' }),
  'surprise-name-it': {
    kind: 'steps',
    steps: [step('Pause for a moment', 3, 'stand'), step('Say it silently to yourself', 12, 'think', 'words')],
  },

  'sadness-self-compassion': {
    kind: 'steps',
    steps: [step('Take a slow breath', 4, 'breathe-in'), step('Say it silently to yourself', 16, 'hand-on-heart', 'words')],
  },
  'sadness-self-hug': {
    kind: 'steps',
    steps: [step('Cross your arms', 4, 'hug-cross'), step('Hold your shoulders', 4, 'hug'), step('Gently squeeze', 12, 'hug-squeeze')],
  },
  'sadness-rocking': {
    kind: 'steps',
    steps: [step('Start to sway gently', 8, 'sway'), step('Slow, steady rocking', 22, 'rock')],
  },

  'disgust-step-back': {
    kind: 'steps',
    steps: [step('Take one step back', 5, 'step-back-1'), step('And one more step', 5, 'step-back-2')],
  },
  'disgust-hand-shake': {
    kind: 'steps',
    steps: [step('Let your hands go loose', 3, 'loose-hands'), step('Shake them lightly', 12, 'shake-hands')],
  },
  'disgust-boundary': {
    kind: 'steps',
    steps: [step('Take a breath', 3, 'breathe-in'), step('Say it silently to yourself', 12, 'boundary', 'words')],
  },

  'anger-fist-release': breathing({ cue: 'Squeeze your fists', pose: 'fists-tight' }, { cue: 'Slowly let go', pose: 'fists-open' }),
  'anger-power-exhale': breathing(
    { cue: 'Breathe in through your nose', pose: 'nose-in' },
    { cue: 'Blow out hard', pose: 'blow-out' },
  ),
  'anger-wall-push': {
    kind: 'steps',
    steps: [step('Hands on the wall', 2, 'wall-ready'), step('Push firmly', 6, 'wall-push'), step('Let go', 2, 'wall-release')],
  },

  'anticipation-next-step': {
    kind: 'steps',
    steps: [step('Think of your next step', 3, 'think', 'star'), step('Make it really small', 3, 'one-finger'), step('Write it down', 3, 'write')],
  },
  'anticipation-visualization': {
    kind: 'steps',
    steps: [
      step('Close your eyes', 5, 'eyes-closed'),
      step('Picture yourself doing it', 15, 'dream', 'star'),
      step('See it done', 10, 'dream-happy', 'check'),
    ],
  },
  'anticipation-focus-breath': breathing(
    { cue: 'Breathe in', pose: 'breathe-in', bubble: 'star' },
    { cue: 'Breathe out', pose: 'breathe-out', bubble: 'star' },
  ),

  'confused-pause-breathe': breathing({ cue: 'Slow breath in', pose: 'breathe-in' }, { cue: 'Longer breath out', pose: 'breathe-out' }),
  'confused-name-one-thing': {
    kind: 'steps',
    steps: [step('Ask: what am I noticing?', 10, 'think', 'question'), step('Name just one thing', 20, 'one-finger', 'one')],
  },
  'confused-focus-dot': {
    kind: 'steps',
    steps: [step('Look at the dot', 10, 'stand'), step('Let your eyes rest on it', 20, 'stand')],
  },
};

const BREATH_GUIDE: Guide = {
  kind: 'breath',
  inhale: { cue: 'Breathe in', pose: 'breathe-in' },
  hold: { cue: 'Hold', pose: 'breathe-hold' },
  exhale: { cue: 'Breathe out', pose: 'breathe-out' },
};

const HOLD_BEAT: GuideBeat = { cue: 'Hold', pose: 'breathe-hold' };

/** Each checklist line gets the sense it names: see, feel or hear. */
function groundingGuide(items: string[]): Guide {
  return {
    kind: 'steps',
    steps: items.map((cue) => {
      const text = cue.toLowerCase();
      if (text.includes('hear')) return step(cue, 3, 'listen', 'ear');
      if (text.includes('feel') || text.includes('touch')) return step(cue, 3, 'touch', 'hand');
      return step(cue, 3, 'look-around', 'eye');
    }),
  };
}

/** The guide for an activity. Activities added later (e.g. from the backend) get one that fits their kind. */
export function guideFor(activity: Activity): Guide {
  if (activity.kind === 'grounding') return groundingGuide(activity.steps ?? []);
  const known = GUIDES[activity.id];
  if (known) return known;

  const seconds = activity.durationSec ?? 20;
  switch (activity.kind) {
    case 'breath':
      return BREATH_GUIDE;
    case 'prompt':
      return { kind: 'steps', steps: [step('Take a quiet moment with it', seconds, 'think', 'words')] };
    case 'share':
      return GUIDES['joy-share-moment'];
    case 'write':
      return { kind: 'steps', steps: [step('Think it over', 3, 'think', 'words'), step('Write it down', 3, 'write')] };
    case 'focus-dot':
      return GUIDES['confused-focus-dot'];
    default:
      return { kind: 'steps', steps: [step('Follow the steps above', seconds, 'stand')] };
  }
}

export type TimelineStep = GuideBeat & {
  /** Seconds from the start of the activity. */
  start: number;
  seconds: number;
  /** 1-based breathing round. */
  round?: number;
};

export type Timeline = { steps: TimelineStep[]; total: number; rounds: number };

function layOut(steps: GuideStep[], length?: number): Timeline {
  const sum = steps.reduce((acc, s) => acc + s.seconds, 0);
  // Fit the steps to the activity's real length, in case it was changed in the content.
  const factor = length && sum > 0 ? length / sum : 1;
  let start = 0;
  const laidOut = steps.map(({ seconds, ...beat }) => {
    const item = { ...beat, start, seconds: seconds * factor };
    start += item.seconds;
    return item;
  });
  return { steps: laidOut, total: start, rounds: 1 };
}

function breathRounds(guide: Extract<Guide, { kind: 'breath' }>, activity: Activity, rounds: number): Timeline {
  const { inhaleSec, holdSec = 0, exhaleSec } = activity.breath ?? { inhaleSec: 4, exhaleSec: 4 };
  const steps: TimelineStep[] = [];
  let start = 0;
  for (let round = 1; round <= rounds; round++) {
    steps.push({ ...guide.inhale, start, seconds: inhaleSec, round });
    start += inhaleSec;
    if (holdSec > 0) {
      steps.push({ ...(guide.hold ?? HOLD_BEAT), start, seconds: holdSec, round });
      start += holdSec;
    }
    steps.push({ ...guide.exhale, start, seconds: exhaleSec, round });
    start += exhaleSec;
  }
  return { steps, total: start, rounds };
}

/** The guide laid out over the activity's real length. */
export function activityTimeline(activity: Activity): Timeline {
  const guide = guideFor(activity);
  if (guide.kind === 'breath') return breathRounds(guide, activity, activity.breath?.rounds ?? 3);
  return layOut(guide.steps, activityDurationSec(activity));
}

/** A short demo of the guide, looped before the activity starts. */
export function previewTimeline(activity: Activity): Timeline {
  const guide = guideFor(activity);
  if (guide.kind === 'breath') return breathRounds(guide, activity, 1);
  return layOut(guide.steps.map((s) => ({ ...s, seconds: Math.min(4, Math.max(2.5, s.seconds)) })));
}

export type StepState = {
  index: number;
  step: TimelineStep;
  /** 0 to 1 within the step. */
  progress: number;
  /** Whole seconds left in the step. */
  left: number;
};

/** Which step is playing `t` seconds into the timeline. */
export function stepAt(timeline: Timeline, t: number): StepState {
  const time = Math.min(Math.max(t, 0), Math.max(0, timeline.total - 1e-6));
  let index = timeline.steps.findIndex((s) => time < s.start + s.seconds);
  if (index < 0) index = timeline.steps.length - 1;
  const current = timeline.steps[index];
  const into = time - current.start;
  return {
    index,
    step: current,
    progress: current.seconds > 0 ? Math.min(1, into / current.seconds) : 1,
    left: Math.max(0, Math.ceil(current.seconds - into - 1e-6)),
  };
}

export type OutlineItem = { cue: string; seconds?: number };

/** The "How it works" list: each distinct step once, with its length for timed activities. */
export function guideOutline(activity: Activity): { items: OutlineItem[]; repeat: number } {
  const guide = guideFor(activity);
  const timed = activityDurationSec(activity) !== undefined;
  if (guide.kind === 'breath') {
    const one = breathRounds(guide, activity, 1);
    return {
      items: one.steps.map((s) => ({ cue: s.cue, seconds: Math.round(s.seconds) })),
      repeat: activity.breath?.rounds ?? 1,
    };
  }
  const items = activityTimeline(activity).steps.map((s) => ({ cue: s.cue, seconds: timed ? Math.round(s.seconds) : undefined }));
  return { items, repeat: 1 };
}
