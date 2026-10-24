import { ACTIVITIES } from '../activities';
import { activityTimeline, guideFor, guideOutline, previewTimeline, stepAt } from '../guides';
import { activityDurationSec, type Activity } from '../types';

const activity = (id: string) => ACTIVITIES.find((a) => a.id === id)!;

describe('activity guides', () => {
  it.each(ACTIVITIES.map((a) => [a.id, a] as const))('%s has short steps that fill the activity', (_id, a) => {
    const timeline = activityTimeline(a);
    expect(timeline.steps.length).toBeGreaterThan(0);
    const length = activityDurationSec(a);
    if (length !== undefined) expect(timeline.total).toBeCloseTo(length, 6);
    for (const step of timeline.steps) {
      // The cue sits under the animation in large type, so it has to stay short.
      expect(step.cue.trim()).not.toBe('');
      expect(step.cue.length).toBeLessThanOrEqual(36);
      expect(step.seconds).toBeGreaterThan(0);
    }
  });

  it('lays a breathing activity out as rounds of in and out', () => {
    const timeline = activityTimeline(activity('fear-long-exhale'));
    expect(timeline.rounds).toBe(5);
    expect(timeline.total).toBe(50);
    expect(timeline.steps.slice(0, 3).map((s) => [s.cue, s.start, s.seconds, s.round])).toEqual([
      ['Breathe in', 0, 4, 1],
      ['Long, slow breath out', 4, 6, 1],
      ['Breathe in', 10, 4, 2],
    ]);
  });

  it('stretches step guides to the activity length', () => {
    const a = { ...activity('anger-wall-push'), durationSec: 20 };
    expect(activityTimeline(a).steps.map((s) => s.seconds)).toEqual([4, 12, 4]);
  });

  it('previews one breath, or each step for a few seconds', () => {
    expect(previewTimeline(activity('fear-long-exhale')).total).toBe(10);
    expect(previewTimeline(activity('trust-connection-recall')).steps.map((s) => s.seconds)).toEqual([4, 4, 4]);
    expect(previewTimeline(activity('anger-wall-push')).steps.map((s) => s.seconds)).toEqual([2.5, 4, 2.5]);
  });

  it('gives each grounding line the sense it names', () => {
    const guide = guideFor(activity('fear-5-4-3'));
    expect(guide.kind === 'steps' && guide.steps.map((s) => [s.pose, s.bubble])).toEqual([
      ['look-around', 'eye'],
      ['touch', 'hand'],
      ['listen', 'ear'],
    ]);
  });

  it('falls back to a guide that fits the kind of a new activity', () => {
    const base: Activity = { ...activity('fear-long-exhale'), id: 'new-from-backend' };
    expect(guideFor(base)).toMatchObject({ kind: 'breath', inhale: { cue: 'Breathe in' } });
    expect(guideFor({ ...base, kind: 'prompt', breath: undefined, durationSec: 30 })).toMatchObject({
      kind: 'steps',
      steps: [{ seconds: 30, pose: 'think' }],
    });
  });

  it('lists each step once for "How it works"', () => {
    expect(guideOutline(activity('fear-long-exhale'))).toEqual({
      items: [
        { cue: 'Breathe in', seconds: 4 },
        { cue: 'Long, slow breath out', seconds: 6 },
      ],
      repeat: 5,
    });
    // Untimed activities don't show seconds.
    expect(guideOutline(activity('joy-share-moment')).items[0]).toEqual({ cue: 'Pick a message', seconds: undefined });
  });
});

describe('stepAt', () => {
  const timeline = activityTimeline(activity('anger-wall-push'));

  it('finds the step, how far into it, and the whole seconds left', () => {
    expect(stepAt(timeline, 0)).toMatchObject({ index: 0, progress: 0, left: 2 });
    expect(stepAt(timeline, 2)).toMatchObject({ index: 1, progress: 0, left: 6 });
    expect(stepAt(timeline, 5)).toMatchObject({ index: 1, progress: 0.5, left: 3 });
    expect(stepAt(timeline, 7.2)).toMatchObject({ index: 1, left: 1 });
  });

  it('stays on the first step before the start and the last step after the end', () => {
    expect(stepAt(timeline, -3)).toMatchObject({ index: 0, progress: 0 });
    const end = stepAt(timeline, 99);
    expect(end).toMatchObject({ index: 2, left: 0 });
    expect(end.progress).toBeCloseTo(1, 5);
  });
});
