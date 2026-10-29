import { signInAnonymously, useAuthStore } from '@/backend/auth-store';
import { syncNow } from '@/backend/sync';
import { newId } from '@/storage/persist';

import { useFeedbackStore, VOICE_MAX_SECONDS } from './store';
import { uploadVoiceMessage } from './voice';

export type VoiceMessage = { uri: string; durationMs: number };

/**
 * Sends feedback from Profile: a written message, a voice message or both. The feedback itself is saved
 * on the device and uploads with the next sync, so writing works offline. A voice message uploads
 * straight away; if it can't, nothing is saved and the error is thrown so the person can try again.
 */
export async function sendFeedback(message: string, voice: VoiceMessage | null): Promise<void> {
  const id = newId();
  let audio: { audioPath: string; audioDurationMs: number } | undefined;
  if (voice) {
    // Every device normally has a guest account; this covers a first launch that was offline.
    if (!useAuthStore.getState().userId) await signInAnonymously();
    const userId = useAuthStore.getState().userId;
    if (!userId) throw new Error('Not connected to the server.');
    audio = {
      audioPath: await uploadVoiceMessage(userId, id, voice.uri),
      audioDurationMs: Math.min(Math.round(voice.durationMs), VOICE_MAX_SECONDS * 1000),
    };
  }
  useFeedbackStore.getState().add({ id, message, sessionId: null, emotionId: null, ...audio });
  void syncNow().catch(() => undefined);
}
