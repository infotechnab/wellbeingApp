import {
  advance,
  completeActivity,
  createSession,
  goBack,
  pauseActivity,
  redoActivity,
  remainingSec,
  resumeActivity,
  startActivity,
  toggleReaction,
} from '../model';

const T0 = 1_000_000;

describe('session model', () => {
  it('builds the fixed activity queue for an emotion', () => {
    const session = createSession('fear', T0, 's1');
    expect(session.activityIds).toEqual(['fear-long-exhale', 'fear-5-4-3', 'fear-foot-press']);
    expect(session.index).toBe(0);
    expect(Object.values(session.progress).every((p) => p.status === 'idle')).toBe(true);
  });

  it('counts down from the activity duration and keeps time across pause and resume', () => {
    const id = 'fear-foot-press'; // 15 s
    let s = createSession('fear', T0, 's1');
    s = startActivity(s, id, T0);
    expect(remainingSec(id, s.progress[id], T0 + 5_000)).toBe(10);

    s = pauseActivity(s, id, T0 + 5_000);
    // Time spent away while paused does not count.
    expect(remainingSec(id, s.progress[id], T0 + 60_000)).toBe(10);

    s = resumeActivity(s, id, T0 + 60_000);
    expect(remainingSec(id, s.progress[id], T0 + 64_000)).toBe(6);
  });

  it('allows unlimited redos and counts each one', () => {
    const id = 'anger-wall-push';
    let s = createSession('anger', T0, 's1');
    s = startActivity(s, id, T0);
    s = completeActivity(s, id, T0 + 10_000);
    s = redoActivity(s, id, T0 + 11_000);
    s = completeActivity(s, id, T0 + 21_000);
    s = redoActivity(s, id, T0 + 22_000);

    expect(s.progress[id]).toMatchObject({ status: 'running', redoCount: 2, completions: 2 });
  });

  it('toggles reactions on and off and switches between them', () => {
    const id = 'joy-smile-relaxation';
    let s = createSession('joy', T0, 's1');
    s = toggleReaction(s, id, 'like');
    expect(s.progress[id].reaction).toBe('like');
    s = toggleReaction(s, id, 'dislike');
    expect(s.progress[id].reaction).toBe('dislike');
    s = toggleReaction(s, id, 'dislike');
    expect(s.progress[id].reaction).toBeUndefined();
  });

  it('marks unfinished activities as skipped and finishes after the last one', () => {
    let s = createSession('surprise', T0, 's1');
    const [first, second, third] = s.activityIds;

    s = startActivity(s, first, T0);
    s = completeActivity(s, first, T0 + 30_000);
    let result = advance(s, T0 + 31_000);
    expect(result.finished).toBe(false);
    expect(result.session.progress[first].skipped).toBe(false);

    result = advance(result.session, T0 + 32_000);
    expect(result.session.progress[second].skipped).toBe(true);
    expect(result.session.index).toBe(2);

    result = advance(result.session, T0 + 33_000);
    expect(result.finished).toBe(true);
    expect(result.session.progress[third].skipped).toBe(true);
  });

  it('pauses the current activity when going back', () => {
    let s = createSession('joy', T0, 's1');
    s = advance(s, T0).session;
    const current = s.activityIds[1];
    s = startActivity(s, current, T0);
    s = goBack(s, T0 + 2_000);
    expect(s.index).toBe(0);
    expect(s.progress[current].status).toBe('paused');
  });
});
