import { render, screen } from '@testing-library/react-native';

import { getActivity } from '@/content';
import { emptyProgress, type ActivityProgress } from '@/session/model';

import { GuideVisual } from '../guide-visual';

const show = (id: string, progress: Partial<ActivityProgress> = {}, extra: { elapsedSec?: number; remaining?: number; total?: number } = {}) =>
  render(<GuideVisual activity={getActivity(id)!} progress={{ ...emptyProgress(), ...progress }} elapsedSec={0} size={200} {...extra} />);

describe('GuideVisual', () => {
  it('lists how the activity works before it starts', async () => {
    await show('fear-foot-press');
    expect(screen.getByText('How it works')).toBeTruthy();
    for (const cue of ['Feet flat on the floor', 'Press down firmly', 'Slowly release']) expect(screen.getByText(cue)).toBeTruthy();
  });

  it('says how many breaths to take', async () => {
    await show('fear-long-exhale');
    expect(screen.getByText('↻ Repeat 5 times')).toBeTruthy();
  });

  it('shows the step to do now while the activity runs', async () => {
    await show('fear-long-exhale', { status: 'running', runningSince: Date.now() }, { remaining: 50, total: 50 });
    expect(screen.getByText('Breathe in')).toBeTruthy();
    expect(screen.getByText(/Round 1 of 5/)).toBeTruthy();
    expect(screen.getByRole('image', { name: 'Animation: Breathe in' })).toBeTruthy();
  });

  it('marks a paused activity as paused', async () => {
    await show('anger-wall-push', { status: 'paused', elapsedMs: 3000 }, { elapsedSec: 3, remaining: 7, total: 10 });
    expect(screen.getByText('Push firmly')).toBeTruthy();
    expect(screen.getByText('Paused · Step 2 of 3')).toBeTruthy();
  });
});
