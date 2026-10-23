import type { Activity, EmotionId } from './types';

/**
 * Micro-activities from the Beta requirements, in the fixed order each emotion runs them
 * (simple to advanced). Fear uses the "3, 2, 1" flow from the brief, so its list starts with the
 * third activity.
 */
export const ACTIVITIES: Activity[] = [
  // Joy
  {
    id: 'joy-savoring-breath',
    emotionId: 'joy',
    kind: 'breath',
    title: 'Savoring Breath',
    instruction: 'Take 3 slow breaths while noticing one pleasant sensation in your body.',
    breath: { inhaleSec: 4, exhaleSec: 6, rounds: 3 },
    research: 'Savoring positive emotion increases wellbeing and emotional resilience.',
  },
  {
    id: 'joy-share-moment',
    emotionId: 'joy',
    kind: 'share',
    title: 'Share the Moment',
    instruction: 'Send a short appreciation message to someone. Pick one, make it yours, and share it.',
    templates: [
      'I was just thinking of you and wanted to say thank you for being in my life.',
      'Something good happened today and you were the first person I wanted to tell.',
      'I really appreciate the way you always make time for me.',
      'You made my day better, and I wanted you to know.',
      'Thank you for your kindness. It meant more than you know.',
    ],
    research: 'Social sharing strengthens positive feelings and relational bonding.',
  },
  {
    id: 'joy-share-energy',
    emotionId: 'joy',
    kind: 'prompt',
    title: 'Share the Energy',
    instruction: 'Simply appreciate someone or something nearby.',
    durationSec: 30,
  },
  {
    id: 'joy-smile-relaxation',
    emotionId: 'joy',
    kind: 'timer',
    title: 'Smile Relaxation',
    instruction: 'Gently smile (a fake smile works too) for 20 seconds and soften your shoulders.',
    durationSec: 20,
    research: 'Facial feedback influences how we experience emotion.',
  },

  // Trust
  {
    id: 'trust-hand-on-heart',
    emotionId: 'trust',
    kind: 'breath',
    title: 'Hand-on-Heart Breathing',
    instruction: 'Place your right hand on your chest and breathe slowly for 5 breaths.',
    breath: { inhaleSec: 5, exhaleSec: 5, rounds: 5 },
    research: 'Self-touch activates parasympathetic calming.',
  },
  {
    id: 'trust-connection-recall',
    emotionId: 'trust',
    kind: 'prompt',
    title: 'Connection Recall',
    instruction: 'Think of one person who supports you and recall a moment with them.',
    durationSec: 45,
    research: 'Recalling secure attachments increases emotional security.',
  },
  {
    id: 'trust-eye-softening',
    emotionId: 'trust',
    kind: 'timer',
    title: 'Eye Softening',
    instruction: 'Relax your eyes and soften your gaze for 20 seconds.',
    durationSec: 20,
    research: 'A soft gaze activates the social safety system.',
  },

  // Fear (flow 3, 2, 1)
  {
    id: 'fear-long-exhale',
    emotionId: 'fear',
    kind: 'breath',
    title: 'Long Exhale Breathing',
    instruction: 'Inhale for 4 seconds, exhale for 6 seconds, for 5 rounds.',
    breath: { inhaleSec: 4, exhaleSec: 6, rounds: 5 },
    research: 'A longer exhale stimulates the vagus nerve.',
  },
  {
    id: 'fear-5-4-3',
    emotionId: 'fear',
    kind: 'grounding',
    title: '5-4-3 Grounding',
    instruction: 'Name 5 things you see, 4 you feel, and 3 you hear.',
    steps: ['5 things you can see', '4 things you can feel', '3 things you can hear'],
    research: 'Grounding reduces amygdala activation and anxiety.',
  },
  {
    id: 'fear-foot-press',
    emotionId: 'fear',
    kind: 'timer',
    title: 'Foot Press Grounding',
    instruction: 'Press your feet firmly into the floor for 15 seconds.',
    durationSec: 15,
    research: 'Pressure input through the body stabilises nervous system regulation.',
  },

  // Surprise
  {
    id: 'surprise-orienting',
    emotionId: 'surprise',
    kind: 'timer',
    title: 'Orienting Look Around',
    instruction: 'Slowly turn your head and look around the room.',
    durationSec: 30,
    research: 'The orienting response helps the brain check that you are safe.',
  },
  {
    id: 'surprise-three-breaths',
    emotionId: 'surprise',
    kind: 'breath',
    title: 'Three Slow Breaths',
    instruction: 'Pause and take three deliberate breaths.',
    breath: { inhaleSec: 4, exhaleSec: 5, rounds: 3 },
    research: 'Brief breath regulation restores cognitive control.',
  },
  {
    id: 'surprise-name-it',
    emotionId: 'surprise',
    kind: 'prompt',
    title: 'Name What Happened',
    instruction: 'Say silently: “Something unexpected happened.”',
    durationSec: 15,
    research: 'Putting feelings into words reduces limbic activation.',
  },

  // Sadness
  {
    id: 'sadness-self-compassion',
    emotionId: 'sadness',
    kind: 'prompt',
    title: 'Self-Compassion Phrase',
    instruction: 'Say to yourself: “This is a difficult moment.”',
    durationSec: 20,
    research: 'Self-compassion reduces emotional distress.',
  },
  {
    id: 'sadness-self-hug',
    emotionId: 'sadness',
    kind: 'timer',
    title: 'Gentle Self-Hug',
    instruction: 'Cross your arms and gently squeeze your shoulders for 20 seconds.',
    durationSec: 20,
    research: 'Self-soothing touch lowers cortisol.',
  },
  {
    id: 'sadness-rocking',
    emotionId: 'sadness',
    kind: 'timer',
    title: 'Slow Rocking Movement',
    instruction: 'Gently sway or rock your body slowly.',
    durationSec: 30,
    research: 'Rhythmic movement regulates emotional distress.',
  },

  // Disgust
  {
    id: 'disgust-step-back',
    emotionId: 'disgust',
    kind: 'timer',
    title: 'Physical Step Back',
    instruction: 'Take two steps away from whatever is bothering you.',
    durationSec: 10,
    research: 'Physical distance reduces emotional reactivity.',
  },
  {
    id: 'disgust-hand-shake',
    emotionId: 'disgust',
    kind: 'timer',
    title: 'Hand Shake Release',
    instruction: 'Shake your hands lightly for 15 seconds.',
    durationSec: 15,
    research: 'Shaking releases tension from the nervous system.',
  },
  {
    id: 'disgust-boundary',
    emotionId: 'disgust',
    kind: 'prompt',
    title: 'Boundary Statement',
    instruction: 'Say silently: “I can step away from this.”',
    durationSec: 15,
    research: 'Boundary statements reduce the stress response.',
  },

  // Anger
  {
    id: 'anger-fist-release',
    emotionId: 'anger',
    kind: 'breath',
    title: 'Fist Clench and Release',
    instruction: 'Clench your fists for 5 seconds, then release slowly. Repeat 3 times.',
    breath: { inhaleSec: 5, exhaleSec: 5, rounds: 3 },
    research: 'Tensing and releasing muscles reduces physical tension.',
  },
  {
    id: 'anger-power-exhale',
    emotionId: 'anger',
    kind: 'breath',
    title: 'Power Exhale',
    instruction: 'Inhale through your nose, then exhale forcefully through your mouth. Repeat 5 times.',
    breath: { inhaleSec: 3, exhaleSec: 2, rounds: 5 },
  },
  {
    id: 'anger-wall-push',
    emotionId: 'anger',
    kind: 'timer',
    title: 'Wall Push',
    instruction: 'Place your hands on a wall and push firmly for 10 seconds.',
    durationSec: 10,
    research: 'Isometric pressure discharges fight energy safely.',
  },

  // Anticipation
  {
    id: 'anticipation-next-step',
    emotionId: 'anticipation',
    kind: 'write',
    title: 'Next Step Write',
    instruction: 'Write the smallest possible next step.',
    placeholder: 'My next small step is…',
    research: 'Mental rehearsal improves motivation and performance.',
  },
  {
    id: 'anticipation-visualization',
    emotionId: 'anticipation',
    kind: 'timer',
    title: 'Future Visualization',
    instruction: 'Close your eyes and imagine completing the next task.',
    durationSec: 30,
    research: 'Mental rehearsal improves motivation and performance.',
  },
  {
    id: 'anticipation-focus-breath',
    emotionId: 'anticipation',
    kind: 'breath',
    title: 'Focus Breath',
    instruction: 'Take 4 slow breaths while thinking about your goal.',
    breath: { inhaleSec: 4, exhaleSec: 4, rounds: 4 },
  },

  // Confused / don't want to say
  {
    id: 'confused-pause-breathe',
    emotionId: 'confused',
    kind: 'breath',
    title: 'Pause & Breathe',
    instruction: 'Take a slow breath in… and a longer breath out. Repeat 5 times.',
    breath: { inhaleSec: 4, exhaleSec: 6, rounds: 5 },
    research: 'Slowing the breath supports nervous system regulation.',
  },
  {
    id: 'confused-name-one-thing',
    emotionId: 'confused',
    kind: 'prompt',
    title: 'Name One Small Thing',
    instruction: 'Gently ask: “What am I noticing right now?” Name just one thing: a body feeling, a thought, or a feeling.',
    durationSec: 30,
  },
  {
    id: 'confused-simple-grounding',
    emotionId: 'confused',
    kind: 'grounding',
    title: 'Simple Grounding',
    instruction: 'Look around and notice what is here with you.',
    steps: ['3 things you can see', '2 things you can feel', '1 thing you can hear'],
    research: 'Grounding attention helps the brain move from confusion toward clarity.',
  },
  {
    id: 'confused-focus-dot',
    emotionId: 'confused',
    kind: 'focus-dot',
    title: 'Dot on a White Screen',
    instruction: 'Look at the dot for 30 seconds.',
    durationSec: 30,
  },
];

export function getActivitiesForEmotion(emotionId: EmotionId): Activity[] {
  return ACTIVITIES.filter((activity) => activity.emotionId === emotionId);
}

export function getActivity(id: string): Activity | undefined {
  return ACTIVITIES.find((activity) => activity.id === id);
}
