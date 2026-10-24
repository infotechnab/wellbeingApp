import { ACTIVITIES, activityTimeline, previewTimeline, type PoseId } from '@/content';

import { elbowFor, figureAt, FOREARM, mixStates, poseState, POSES, UPPER_ARM, type FigureState } from '../pose';

/** Every number that ends up in the drawing, keyed by where it came from. */
function numbers(s: FigureState): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(s)) if (typeof value === 'number') out[key] = value;
  for (const side of ['left', 'right'] as const) {
    const h = s[side];
    [h.x, h.y, h.angle ?? 0, ...(h.pole ?? []), ...(h.elbow ?? [])].forEach((v, i) => (out[`${side}.${i}`] = v));
  }
  return out;
}

const broken = (s: FigureState) => Object.entries(numbers(s)).filter(([, v]) => !Number.isFinite(v));

describe('poses', () => {
  it.each(Object.keys(POSES) as PoseId[])('%s draws with real numbers', (pose) => {
    for (const p of [0, 0.5, 1]) {
      expect(broken(poseState(pose, { p, t: 3.3, still: false }))).toEqual([]);
      expect(broken(poseState(pose, { p, t: 3.3, still: true }))).toEqual([]);
    }
  });

  it('animates every activity from start to finish, and its preview', () => {
    for (const activity of ACTIVITIES) {
      for (const timeline of [activityTimeline(activity), previewTimeline(activity)]) {
        for (let t = 0; t <= timeline.total; t += 0.37) {
          expect(broken(figureAt(timeline, t))).toEqual([]);
          expect(broken(figureAt(timeline, t, { still: true }))).toEqual([]);
        }
      }
    }
  });

  it('eases into a new step from where the last one ended', () => {
    const timeline = activityTimeline(ACTIVITIES.find((a) => a.id === 'anger-wall-push')!);
    // "Let go" starts at 8s; just after, the figure is still close to the push.
    const pushing = figureAt(timeline, 7.99);
    const justAfter = figureAt(timeline, 8.02);
    const settled = figureAt(timeline, 9.5);
    expect(Math.abs(justAfter.lean - pushing.lean)).toBeLessThan(1);
    expect(settled.lean).toBe(0);
  });

  it('holds still when motion is reduced', () => {
    const timeline = activityTimeline(ACTIVITIES.find((a) => a.id === 'sadness-rocking')!);
    expect(figureAt(timeline, 12, { still: true })).toEqual(figureAt(timeline, 20, { still: true }));
  });

  it('fades a thought out before showing the next one', () => {
    const thinking = poseState('think', { p: 1, t: 0, still: true }, 'people');
    const remembering = poseState('remember', { p: 0, t: 0, still: true }, 'heart');
    expect(mixStates(thinking, remembering, 0.25)).toMatchObject({ bubble: 0.5, bubbleIcon: 'people' });
    expect(mixStates(thinking, remembering, 0.5).bubble).toBe(0);
    expect(mixStates(thinking, remembering, 0.75)).toMatchObject({ bubble: 0.5, bubbleIcon: 'heart' });
  });

  it('blends into a fixed elbow from the natural bend', () => {
    const standing = poseState('stand', { p: 1, t: 0, still: true });
    const hugging = poseState('hug', { p: 0, t: 0, still: true });
    expect(mixStates(standing, hugging, 1).left.elbow).toEqual(hugging.left.elbow);
    expect(mixStates(standing, hugging, 0.5).left.elbow).toBeDefined();
    expect(mixStates(standing, standing, 0.5).left.elbow).toBeUndefined();
  });
});

describe('elbowFor', () => {
  const shoulder = { x: 74, y: 118 };

  it('keeps both arm bones their length when the hand is in reach', () => {
    const hand = { x: 60, y: 150, shape: 'open' as const };
    const elbow = elbowFor(shoulder, hand, -1);
    expect(Math.hypot(elbow.x - shoulder.x, elbow.y - shoulder.y)).toBeCloseTo(UPPER_ARM);
    expect(Math.hypot(hand.x - elbow.x, hand.y - elbow.y)).toBeCloseTo(FOREARM);
  });

  it('bends towards the pole', () => {
    const hand = { x: 74, y: 150, shape: 'open' as const };
    expect(elbowFor(shoulder, { ...hand, pole: [-1, 0] }, -1).x).toBeLessThan(74);
    expect(elbowFor(shoulder, { ...hand, pole: [1, 0] }, -1).x).toBeGreaterThan(74);
  });

  it('uses a fixed elbow when the pose gives one', () => {
    expect(elbowFor(shoulder, { x: 120, y: 120, shape: 'open', elbow: [80, 150] }, -1)).toEqual({ x: 80, y: 150 });
  });
});
