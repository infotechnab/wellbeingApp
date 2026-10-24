import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useFeedbackStore } from '@/feedback/store';
import { useNotesStore } from '@/journal/notes-store';
import { useHistoryStore, type SessionSummary } from '@/session/history';
import { useSketchStore } from '@/sketch/store';
import { deviceStorage, storageKey } from '@/storage/persist';
import { useTelemetryStore } from '@/telemetry/store';

import { useAuthStore } from './auth-store';
import { supabase } from './client';

const iso = (ms: number) => new Date(ms).toISOString();
const BATCH = 200;

/** Which account this device last uploaded its journal to. */
export const useSyncState = create<{ userId: string | null }>()(
  persist(() => ({ userId: null as string | null }), { name: storageKey('sync'), storage: deviceStorage, version: 1 }),
);

/**
 * When the device moves to another account (a guest creates one or signs in), the whole journal is
 * uploaded to it, including anything an earlier account already has. Activity events and feedback
 * are not re-sent, so the preference statistics don't count anything twice.
 */
function resetJournalSyncIfAccountChanged(userId: string) {
  if (useSyncState.getState().userId === userId) return;
  const unsync = <T extends { syncedAt?: number }>(items: T[]) => items.map((item) => ({ ...item, syncedAt: undefined }));
  useHistoryStore.setState((s) => ({ sessions: unsync(s.sessions) }));
  useSketchStore.setState((s) => ({ sketches: unsync(s.sketches) }));
  useNotesStore.setState((s) => ({ notes: unsync(s.notes) }));
  useSyncState.setState({ userId });
}

async function upload<T extends { id: string }>(
  table: string,
  userId: string,
  items: T[],
  toRow: (item: T) => Record<string, unknown>,
  markSynced: (ids: string[], at: number) => void,
) {
  for (let i = 0; i < items.length; i += BATCH) {
    const chunk = items.slice(i, i + BATCH);
    const rows = chunk.map((item) => ({ ...toRow(item), user_id: userId }));
    const { error } = await supabase!.from(table).upsert(rows, { onConflict: 'user_id,id' });
    if (error) throw new Error(`${table}: ${error.message}`);
    markSynced(
      chunk.map((item) => item.id),
      Date.now(),
    );
  }
}

let running: Promise<void> | null = null;

/**
 * Uploads what this device recorded that the server doesn't have yet: activity events and feedback
 * for everyone, and the journal (check-ins, sketches and notes) only with an account. Safe to call
 * often: calls overlap into one run, and nothing happens offline or without a signed-in (or
 * anonymous) user.
 */
export function syncNow(): Promise<void> {
  if (!supabase || !useAuthStore.getState().userId) return Promise.resolve();
  running ??= runSync().finally(() => {
    running = null;
  });
  return running;
}

async function runSync() {
  const { userId, status } = useAuthStore.getState();
  if (!userId) return;

  const telemetry = useTelemetryStore.getState();
  await upload(
    'activity_events',
    userId,
    telemetry.events.filter((e) => !e.syncedAt),
    (e) => ({ id: e.id, session_id: e.sessionId, emotion_id: e.emotionId, activity_id: e.activityId, type: e.type, at: iso(e.at) }),
    telemetry.markSynced,
  );

  const feedback = useFeedbackStore.getState();
  await upload(
    'feedback',
    userId,
    feedback.entries.filter((f) => !f.syncedAt),
    (f) => ({ id: f.id, session_id: f.sessionId, emotion_id: f.emotionId, message: f.message, created_at: iso(f.createdAt) }),
    feedback.markSynced,
  );

  // A guest's journal stays on the device. Creating an account uploads all of it.
  if (status !== 'signed-in') return;
  resetJournalSyncIfAccountChanged(userId);

  const history = useHistoryStore.getState();
  await upload(
    'session_summaries',
    userId,
    history.sessions.filter((s) => !s.syncedAt),
    (s) => ({
      id: s.id,
      emotion_id: s.emotionId,
      started_at: iso(s.startedAt),
      ended_at: iso(s.endedAt),
      completed: s.completed,
      skipped: s.skipped,
      total: s.total,
      redos: s.redos,
    }),
    history.markSynced,
  );

  const sketches = useSketchStore.getState();
  await upload(
    'sketches',
    userId,
    sketches.sketches.filter((s) => !s.syncedAt),
    (s) => ({ id: s.id, width: s.width, height: s.height, strokes: s.strokes, created_at: iso(s.createdAt) }),
    sketches.markSynced,
  );

  const notes = useNotesStore.getState();
  await upload(
    'notes',
    userId,
    notes.notes.filter((n) => !n.syncedAt),
    (n) => ({ id: n.id, activity_id: n.activityId, emotion_id: n.emotionId, text: n.text, created_at: iso(n.createdAt) }),
    notes.markSynced,
  );
}

/** After signing in on a new device, brings the account's journal down to this device. */
export async function pullJournal(): Promise<void> {
  if (!supabase) return;
  const [sessions, sketches, notes] = await Promise.all([
    supabase.from('session_summaries').select('*').order('ended_at', { ascending: false }).limit(200),
    supabase.from('sketches').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('notes').select('*').order('created_at', { ascending: false }).limit(500),
  ]);
  const now = Date.now();
  const ms = (value: string) => Date.parse(value);

  if (sessions.data) {
    useHistoryStore.getState().merge(
      sessions.data.map(
        (r): SessionSummary => ({
          id: r.id,
          emotionId: r.emotion_id,
          startedAt: ms(r.started_at),
          endedAt: ms(r.ended_at),
          completed: r.completed,
          skipped: r.skipped,
          total: r.total,
          redos: r.redos,
          syncedAt: now,
        }),
      ),
    );
  }
  if (sketches.data) {
    useSketchStore.getState().merge(
      sketches.data.map((r) => ({
        id: r.id,
        width: r.width,
        height: r.height,
        strokes: r.strokes,
        createdAt: ms(r.created_at),
        syncedAt: now,
      })),
    );
  }
  if (notes.data) {
    useNotesStore.getState().merge(
      notes.data.map((r) => ({
        id: r.id,
        activityId: r.activity_id,
        emotionId: r.emotion_id,
        text: r.text,
        createdAt: ms(r.created_at),
        syncedAt: now,
      })),
    );
  }
}

/** Removes personal data from this device, e.g. after logging out. */
export function clearLocalJournal() {
  useHistoryStore.setState({ sessions: [] });
  useSketchStore.setState({ sketches: [] });
  useNotesStore.setState({ notes: [] });
  useFeedbackStore.setState({ entries: [] });
  useTelemetryStore.setState({ events: [] });
}
