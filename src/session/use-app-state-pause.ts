import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useSessionStore } from './store';

/**
 * Pauses a running activity when the app leaves the foreground and resumes it on return, so the
 * user comes back to exactly where they were. If the app is closed in between, the activity stays
 * paused and the user taps Resume.
 */
export function useAppStatePause() {
  const pausedActivity = useRef<string | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      const store = useSessionStore.getState();
      const session = store.session;
      if (state === 'background' || state === 'inactive') {
        if (!session) return;
        const activityId = session.activityIds[session.index];
        if (session.progress[activityId].status === 'running') {
          pausedActivity.current = activityId;
          store.suspend();
        }
      } else if (state === 'active' && pausedActivity.current) {
        store.resume(pausedActivity.current);
        pausedActivity.current = null;
      }
    });
    return () => sub.remove();
  }, []);
}
