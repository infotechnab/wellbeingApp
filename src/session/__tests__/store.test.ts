import { useTelemetryStore } from '@/telemetry/store';

import { useHistoryStore } from '../history';
import { useSessionStore } from '../store';

const types = () => useTelemetryStore.getState().events.map((e) => [e.type, e.activityId]);

describe('session store', () => {
  beforeEach(() => {
    useSessionStore.setState({ session: null });
    useTelemetryStore.setState({ events: [] });
    useHistoryStore.setState({ sessions: [] });
  });

  it('records preference telemetry and saves a summary when the session ends', () => {
    const store = useSessionStore.getState();
    store.begin('disgust');
    const [first, second, third] = useSessionStore.getState().session!.activityIds;

    store.start(first);
    store.complete(first);
    store.react(first, 'like');
    store.redo(first);
    store.complete(first);
    expect(store.next()).toBe(false);
    store.react(second, 'dislike');
    expect(store.next()).toBe(false);
    expect(store.next()).toBe(true);
    expect(useSessionStore.getState().session?.finished).toBe(true);
    store.end();

    expect(types()).toEqual([
      ['session_start', null],
      ['start', first],
      ['complete', first],
      ['like', first],
      ['redo', first],
      ['complete', first],
      ['dislike', second],
      ['skip', second],
      ['skip', third],
      ['session_end', null],
    ]);
    expect(useSessionStore.getState().session).toBeNull();
    expect(useHistoryStore.getState().sessions[0]).toMatchObject({
      emotionId: 'disgust',
      completed: 1,
      skipped: 2,
      total: 3,
      redos: 1,
    });
  });

  it('starts a fresh queue when a new emotion is picked mid-session', () => {
    const store = useSessionStore.getState();
    store.begin('joy');
    store.next();
    store.begin('anger');

    const session = useSessionStore.getState().session!;
    expect(session.emotionId).toBe('anger');
    expect(session.index).toBe(0);
    expect(useHistoryStore.getState().sessions).toHaveLength(1);
  });

  it('suspends a running activity', () => {
    const store = useSessionStore.getState();
    store.begin('anger');
    const id = useSessionStore.getState().session!.activityIds[0];
    store.start(id);
    store.suspend();
    expect(useSessionStore.getState().session!.progress[id].status).toBe('paused');
  });
});

describe('recoverAfterRestart', () => {
  it('pauses an activity left running by a crash instead of letting it finish', () => {
    const store = useSessionStore.getState();
    store.begin('anger');
    const id = useSessionStore.getState().session!.activityIds[2]; // Wall Push, 10 s
    const session = useSessionStore.getState().session!;
    useSessionStore.setState({
      session: {
        ...session,
        index: 2,
        progress: {
          ...session.progress,
          [id]: { ...session.progress[id], status: 'running', runningSince: Date.now() - 60_000, elapsedMs: 3_000 },
        },
      },
    });

    useSessionStore.getState().recoverAfterRestart();

    expect(useSessionStore.getState().session!.progress[id]).toMatchObject({ status: 'paused', elapsedMs: 3_000 });
  });
});
