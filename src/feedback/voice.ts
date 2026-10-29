import { supabase } from '@/backend/client';

import { readRecording } from './read-recording';

/** The private storage bucket for voice messages (supabase/migrations/20261029000000_voice_feedback.sql). */
export const VOICE_BUCKET = 'feedback-audio';

/**
 * Uploads a voice message into the person's own folder in the bucket and returns its path there. People
 * can't play it back from the app; the team listens in the Supabase dashboard.
 */
export async function uploadVoiceMessage(userId: string, feedbackId: string, uri: string): Promise<string> {
  if (!supabase) throw new Error('Voice messages need the app’s server, which this build doesn’t have.');
  const { bytes, contentType, extension } = await readRecording(uri);
  const path = `${userId}/${feedbackId}${extension}`;
  const { error } = await supabase.storage.from(VOICE_BUCKET).upload(path, bytes, { contentType });
  // A retry after a lost response finds the file already there, which is fine.
  if (error && (error as { statusCode?: string }).statusCode !== '409') throw error;
  return path;
}
