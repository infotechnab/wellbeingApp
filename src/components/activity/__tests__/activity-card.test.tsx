import { render, screen, userEvent } from '@testing-library/react-native';

import { getActivity } from '@/content';
import { emptyProgress, type ActivityProgress } from '@/session/model';

import { ActivityCard, type ActivityCardProps } from '../activity-card';

// Reanimated can't run under Jest in this SDK; the animated pieces aren't what these tests cover.
jest.mock('../buddy', () => ({ Buddy: () => null }));
jest.mock('@/components/toast', () => ({ useToast: () => jest.fn() }));

const handlers = () => ({
  onStart: jest.fn(),
  onPause: jest.fn(),
  onResume: jest.fn(),
  onComplete: jest.fn(),
  onRedo: jest.fn(),
  onReact: jest.fn(),
  onNext: jest.fn(),
});

const renderCard = async (activityId: string, progress: Partial<ActivityProgress>, extra: Partial<ActivityCardProps> = {}) => {
  const props = handlers();
  await render(
    <ActivityCard
      activity={getActivity(activityId)!}
      progress={{ ...emptyProgress(), ...progress }}
      visualSize={200}
      isLast={false}
      {...props}
      {...extra}
    />,
  );
  return props;
};

describe('ActivityCard', () => {
  it('starts an idle activity and offers to skip it', async () => {
    const user = userEvent.setup();
    const props = await renderCard('anger-wall-push', {});
    await user.press(screen.getByRole('button', { name: 'Start' }));
    await user.press(screen.getByRole('button', { name: 'Skip for now' }));
    expect(props.onStart).toHaveBeenCalled();
    expect(props.onNext).toHaveBeenCalled();
  });

  it('offers Redo and Next once the activity is done', async () => {
    const user = userEvent.setup();
    const props = await renderCard('anger-wall-push', { status: 'done', completions: 1 });
    await user.press(screen.getByRole('button', { name: '↻ Redo' }));
    expect(props.onRedo).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
  });

  it('says Finish on the last activity', async () => {
    await renderCard('anger-wall-push', { status: 'done', completions: 1 }, { isLast: true });
    expect(screen.getByRole('button', { name: 'Finish' })).toBeTruthy();
  });

  it('lets the user like an activity without blocking anything', async () => {
    const user = userEvent.setup();
    const props = await renderCard('joy-smile-relaxation', {});
    await user.press(screen.getByRole('button', { name: 'I like this activity' }));
    expect(props.onReact).toHaveBeenCalledWith('like');
  });

  it('completes a grounding checklist when every item is ticked', async () => {
    const user = userEvent.setup();
    const props = await renderCard('fear-5-4-3', { status: 'running', runningSince: Date.now() });
    for (const label of ['5 things you can see', '4 things you can feel', '3 things you can hear']) {
      await user.press(screen.getByText(label));
    }
    expect(props.onComplete).toHaveBeenCalledTimes(1);
  });
});
