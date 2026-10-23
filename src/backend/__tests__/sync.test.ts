import { useFeedbackStore } from '@/feedback/store';
import { useNotesStore } from '@/journal/notes-store';
import { useHistoryStore } from '@/session/history';
import { useSketchStore } from '@/sketch/store';
import { useTelemetryStore } from '@/telemetry/store';

import { useAuthStore } from '../auth-store';
import { clearLocalJournal, syncNow, useSyncState } from '../sync';
import { validateCredentials } from '../validation';

const mockUpserts: { table: string; rows: Record<string, unknown>[]; onConflict?: string }[] = [];
let mockFailTable: string | null = null;

jest.mock('../client', () => ({
  supabase: {
    from: (table: string) => ({
      upsert: async (rows: Record<string, unknown>[], options?: { onConflict?: string }) => {
        if (table === mockFailTable) return { error: { message: 'offline' } };
        mockUpserts.push({ table, rows, onConflict: options?.onConflict });
        return { error: null };
      },
    }),
  },
  isBackendConfigured: true,
}));

const seed = () => {
  useTelemetryStore.getState().record({ type: 'like', sessionId: 's1', emotionId: 'joy', activityId: 'joy-smile-relaxation' });
  useFeedbackStore.getState().add({ message: 'Lovely', sessionId: 's1', emotionId: 'joy' });
  useNotesStore.getState().add({ text: 'Call mum', activityId: 'anticipation-next-step', emotionId: 'anticipation' });
};

describe('sync', () => {
  beforeEach(() => {
    mockUpserts.length = 0;
    mockFailTable = null;
    clearLocalJournal();
    useSyncState.setState({ userId: null });
    useAuthStore.setState({ status: 'anonymous', userId: 'user-1', email: null });
  });

  it('uploads unsynced rows once and marks them synced', async () => {
    seed();
    await syncNow();

    expect(mockUpserts.map((u) => u.table)).toEqual(['activity_events', 'feedback', 'notes']);
    expect(mockUpserts[0].rows[0]).toMatchObject({
      type: 'like',
      activity_id: 'joy-smile-relaxation',
      session_id: 's1',
      user_id: 'user-1',
    });
    expect(mockUpserts.every((u) => u.onConflict === 'user_id,id')).toBe(true);
    expect(useTelemetryStore.getState().events.every((e) => e.syncedAt)).toBe(true);

    mockUpserts.length = 0;
    await syncNow();
    expect(mockUpserts).toHaveLength(0);
  });

  it('uploads the journal again, but not events, when the device switches account', async () => {
    seed();
    useHistoryStore.getState().add({ id: 'h1', emotionId: 'joy', startedAt: 0, endedAt: 1, completed: 1, skipped: 0, total: 3, redos: 0 });
    await syncNow();

    mockUpserts.length = 0;
    useAuthStore.setState({ status: 'signed-in', userId: 'user-2', email: 'a@b.co' });
    await syncNow();

    expect(mockUpserts.map((u) => u.table)).toEqual(['session_summaries', 'notes']);
    expect(mockUpserts[0].rows[0]).toMatchObject({ id: 'h1', user_id: 'user-2' });
  });

  it('keeps rows pending when the upload fails', async () => {
    seed();
    mockFailTable = 'feedback';
    await expect(syncNow()).rejects.toThrow('feedback: offline');
    expect(useTelemetryStore.getState().events[0].syncedAt).toBeDefined();
    expect(useFeedbackStore.getState().entries[0].syncedAt).toBeUndefined();
  });

  it('does nothing without a user', async () => {
    seed();
    useAuthStore.setState({ status: 'signed-out', userId: null, email: null });
    await syncNow();
    expect(mockUpserts).toHaveLength(0);
  });

  it('clears personal data from the device', () => {
    seed();
    useSketchStore.getState().save({ width: 10, height: 10, strokes: [] });
    useHistoryStore.getState().add({ id: 'h', emotionId: 'joy', startedAt: 0, endedAt: 1, completed: 1, skipped: 0, total: 3, redos: 0 });
    clearLocalJournal();
    expect(useTelemetryStore.getState().events).toHaveLength(0);
    expect(useSketchStore.getState().sketches).toHaveLength(0);
    expect(useHistoryStore.getState().sessions).toHaveLength(0);
  });
});

describe('validateCredentials', () => {
  it('checks email shape and password length', () => {
    expect(validateCredentials('not-an-email', 'longenough')).not.toBeNull();
    expect(validateCredentials('a@b.co', 'short')).not.toBeNull();
    expect(validateCredentials(' a@b.co ', 'longenough')).toBeNull();
  });
});
