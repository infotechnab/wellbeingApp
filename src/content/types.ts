export type EmotionId =
  | 'joy'
  | 'trust'
  | 'fear'
  | 'surprise'
  | 'sadness'
  | 'disgust'
  | 'anger'
  | 'anticipation'
  | 'confused';

export type Emotion = {
  id: EmotionId;
  name: string;
  /** First-person line shown after the emotion is chosen. */
  theme: string;
  need: string;
  bodyResponse: string;
  /** Soft petal colour; text on it always uses the dark ink colour. */
  color: string;
};

/**
 * How an activity is presented:
 * - `breath`: paced inhale/exhale rounds
 * - `timer`: hold or move for a fixed time
 * - `prompt`: a phrase or thought to sit with for a moment
 * - `share`: pick and edit an appreciation message, then share it
 * - `write`: write a short note (saved to the journal)
 * - `grounding`: tick off a short sensory checklist
 * - `focus-dot`: look at a dot on a blank screen
 */
export type ActivityKind = 'breath' | 'timer' | 'prompt' | 'share' | 'write' | 'grounding' | 'focus-dot';

export type BreathPattern = {
  inhaleSec: number;
  holdSec?: number;
  exhaleSec: number;
  rounds: number;
};

export type Activity = {
  id: string;
  emotionId: EmotionId;
  kind: ActivityKind;
  title: string;
  instruction: string;
  /** Length of the timed part. Activities without one are finished with a "Done" button. */
  durationSec?: number;
  breath?: BreathPattern;
  /** Checklist items for `grounding`. */
  steps?: string[];
  /** Message templates for `share`. */
  templates?: string[];
  /** Placeholder for `write`. */
  placeholder?: string;
  research?: string;
};

export function breathDurationSec({ inhaleSec, holdSec = 0, exhaleSec, rounds }: BreathPattern): number {
  return (inhaleSec + holdSec + exhaleSec) * rounds;
}

export function activityDurationSec(activity: Activity): number | undefined {
  if (activity.breath) return breathDurationSec(activity.breath);
  return activity.durationSec;
}
