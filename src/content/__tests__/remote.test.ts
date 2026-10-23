import { ACTIVITIES } from '../activities';
import { AFFIRMATIONS } from '../affirmations';
import { EMOTIONS } from '../emotions';
import { applyContent, parseRemoteContent, type RemoteContent } from '../remote';

const bundled = (): RemoteContent => {
  const order: Record<string, number> = {};
  return {
    emotions: Object.values(EMOTIONS).map((e) => ({ id: e.id, name: e.name, theme: e.theme, need: e.need, body_response: e.bodyResponse })),
    activities: ACTIVITIES.map((a) => ({
      id: a.id,
      emotion_id: a.emotionId,
      sort_order: (order[a.emotionId] = (order[a.emotionId] ?? -1) + 1),
      kind: a.kind,
      title: a.title,
      instruction: a.instruction,
      duration_sec: a.durationSec ?? null,
      breath: a.breath ?? null,
      steps: a.steps ?? null,
      templates: a.templates ?? null,
      placeholder: a.placeholder ?? null,
      research: a.research ?? null,
    })),
    affirmations: AFFIRMATIONS.map((text) => ({ text })),
  };
};

describe('remote content', () => {
  it('accepts content that matches the bundled set', () => {
    const parsed = parseRemoteContent(bundled());
    expect(parsed?.activities).toHaveLength(ACTIVITIES.length);
  });

  it('drops invalid activities and rejects sets that leave an emotion empty', () => {
    const remote = bundled();
    remote.activities = remote.activities.filter((a) => a.emotion_id !== 'joy' || a.kind === 'breath');
    remote.activities.push({ ...remote.activities[0], id: 'bad', kind: 'dance' });
    expect(parseRemoteContent(remote)?.activities.some((a) => a.id === 'bad')).toBe(false);

    remote.activities = remote.activities.filter((a) => a.emotion_id !== 'anger');
    expect(parseRemoteContent(remote)).toBeNull();
  });

  it('applies edited wording in place', () => {
    const remote = bundled();
    remote.activities[0].title = 'Savouring Breath';
    remote.emotions[0].theme = 'Edited theme';
    applyContent(parseRemoteContent(remote)!);
    expect(ACTIVITIES[0].title).toBe('Savouring Breath');
    expect(EMOTIONS.joy.theme).toBe('Edited theme');
  });
});
