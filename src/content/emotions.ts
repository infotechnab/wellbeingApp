import type { Emotion, EmotionId } from './types';

/** Wheel order, clockwise from the top. `confused` sits in the centre of the wheel. */
export const WHEEL_ORDER: EmotionId[] = [
  'joy',
  'trust',
  'fear',
  'surprise',
  'sadness',
  'disgust',
  'anger',
  'anticipation',
];

export const EMOTIONS: Record<EmotionId, Emotion> = {
  joy: {
    id: 'joy',
    name: 'Joy',
    theme: 'I feel good and want to enjoy or share this moment.',
    need: 'Savoring, connection',
    bodyResponse: 'Social engagement (regulated nervous system)',
    color: '#F7DC8C',
  },
  trust: {
    id: 'trust',
    name: 'Trust',
    theme: 'I feel safe and comfortable with someone or something.',
    need: 'Safety, bonding',
    bodyResponse: 'Social engagement / healthy connection',
    color: '#BFE3B4',
  },
  fear: {
    id: 'fear',
    name: 'Fear',
    theme: 'Something feels unsafe and I want to protect myself.',
    need: 'Safety, grounding',
    bodyResponse: 'Flight',
    color: '#9FD1C0',
  },
  surprise: {
    id: 'surprise',
    name: 'Surprise',
    theme: 'Something unexpected just happened and I need a moment to make sense of it.',
    need: 'Orientation, clarity',
    bodyResponse: 'Brief freeze',
    color: '#A9D8EC',
  },
  sadness: {
    id: 'sadness',
    name: 'Sadness',
    theme: 'I feel low or hurt and need comfort or support.',
    need: 'Comfort, compassion',
    bodyResponse: 'Freeze / withdrawal',
    color: '#B4C6EC',
  },
  disgust: {
    id: 'disgust',
    name: 'Disgust',
    theme: 'Something feels wrong or unpleasant and I want to move away.',
    need: 'Boundaries, protection',
    bodyResponse: 'Rejection / avoidance',
    color: '#D3BFE6',
  },
  anger: {
    id: 'anger',
    name: 'Anger',
    theme: 'Something feels unfair or upsetting and I want it to change.',
    need: 'Justice, expression',
    bodyResponse: 'Fight',
    color: '#F4B3A9',
  },
  anticipation: {
    id: 'anticipation',
    name: 'Anticipation',
    theme: 'Something is coming and I’m preparing or thinking about what’s next.',
    need: 'Direction, preparation',
    bodyResponse: 'Mild activation',
    color: '#F7C9A0',
  },
  confused: {
    id: 'confused',
    name: 'Not sure',
    theme: 'I’m confused, or I don’t want to say right now. That’s okay.',
    need: 'Clarity, grounding, gentle understanding',
    bodyResponse: 'Mental overload / scattered attention',
    color: '#E7E2DA',
  },
};

export const EMOTION_INK = '#2F3437';

export function getEmotion(id: EmotionId): Emotion {
  return EMOTIONS[id];
}
