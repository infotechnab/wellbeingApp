import { ACTIVITIES, activityDurationSec, AFFIRMATIONS, EMOTIONS, getActivitiesForEmotion, pickAffirmation, WHEEL_ORDER } from '..';

describe('content', () => {
  it('has activities for every emotion on the wheel plus “not sure”', () => {
    for (const id of [...WHEEL_ORDER, 'confused' as const]) {
      expect(EMOTIONS[id].theme.length).toBeGreaterThan(0);
      expect(getActivitiesForEmotion(id).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('uses unique activity ids', () => {
    const ids = ACTIVITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives each activity kind the data it needs', () => {
    for (const activity of ACTIVITIES) {
      switch (activity.kind) {
        case 'breath':
          expect(activity.breath).toBeDefined();
          break;
        case 'timer':
        case 'prompt':
        case 'focus-dot':
          expect(activityDurationSec(activity)).toBeGreaterThan(0);
          break;
        case 'grounding':
          expect(activity.steps?.length).toBeGreaterThan(0);
          break;
        case 'share':
          expect(activity.templates?.length).toBeGreaterThan(0);
          break;
        case 'write':
          expect(activityDurationSec(activity)).toBeUndefined();
          break;
      }
    }
  });

  it('picks an affirmation from the list', () => {
    expect(pickAffirmation(() => 0)).toBe(AFFIRMATIONS[0]);
    expect(pickAffirmation(() => 0.9999)).toBe(AFFIRMATIONS[AFFIRMATIONS.length - 1]);
  });
});
