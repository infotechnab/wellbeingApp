export const AFFIRMATIONS: string[] = [
  'You are allowed to take things one small step at a time.',
  'Whatever you feel right now is welcome here.',
  'You have handled hard days before, and you can handle this one.',
  'Breathing slowly is already an act of care.',
  'You don’t have to have it all figured out today.',
  'Small steps still move you forward.',
  'Your feelings are information, not a verdict.',
  'Rest is part of the work, not a break from it.',
  'You deserve the same kindness you give to others.',
  'This moment is enough, and so are you.',
  'It’s okay to pause before you respond.',
  'You can be a work in progress and still be whole.',
  'Notice one good thing. It counts.',
  'Gentle is still strong.',
  'You are not alone in feeling this way.',
];

export function pickAffirmation(random: () => number = Math.random): string {
  return AFFIRMATIONS[Math.floor(random() * AFFIRMATIONS.length)];
}
