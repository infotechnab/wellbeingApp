import { EMOTIONS, type EmotionId } from '@/content';
import { useHistoryStore } from '@/session/history';
import { newId } from '@/storage/persist';

import { whenHydrated } from './hydrate';

/**
 * Saves a feeling picked on the reminder as a check-in in the journal. It has no activities yet, so it shows
 * as a quick check-in and is backed up like any other check-in once the person has an account.
 */
export async function saveQuickCheckIn(emotionId: EmotionId, at: number = Date.now()): Promise<void> {
  if (!(emotionId in EMOTIONS)) return;
  await whenHydrated(useHistoryStore);
  useHistoryStore.getState().add({
    id: newId(),
    emotionId,
    startedAt: at,
    endedAt: at,
    completed: 0,
    skipped: 0,
    total: 0,
    redos: 0,
  });
}
