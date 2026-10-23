import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { applyContent, parseRemoteContent, type RemoteContent } from '@/content';
import { deviceStorage, storageKey } from '@/storage/persist';

import { supabase } from './client';

type ContentCacheStore = {
  remote: RemoteContent | null;
  fetchedAt: number | null;
  setRemote: (remote: RemoteContent) => void;
};

/** Last content downloaded from Supabase, so edits show up offline after one successful fetch. */
export const useContentCache = create<ContentCacheStore>()(
  persist(
    (set) => ({
      remote: null,
      fetchedAt: null,
      setRemote: (remote) => set({ remote, fetchedAt: Date.now() }),
    }),
    { name: storageKey('content'), storage: deviceStorage, version: 1 },
  ),
);

export function applyCachedContent(): boolean {
  const remote = useContentCache.getState().remote;
  const parsed = remote ? parseRemoteContent(remote) : null;
  if (parsed) applyContent(parsed);
  return !!parsed;
}

export async function refreshContent(): Promise<boolean> {
  if (!supabase) return false;
  const [emotions, activities, affirmations] = await Promise.all([
    supabase.from('emotions').select('id, name, theme, need, body_response'),
    supabase
      .from('activities')
      .select('id, emotion_id, sort_order, kind, title, instruction, duration_sec, breath, steps, templates, placeholder, research')
      .eq('active', true),
    supabase.from('affirmations').select('text').eq('active', true),
  ]);
  if (emotions.error || activities.error || affirmations.error) return false;

  const remote: RemoteContent = {
    emotions: emotions.data ?? [],
    activities: activities.data ?? [],
    affirmations: affirmations.data ?? [],
  };
  const parsed = parseRemoteContent(remote);
  if (!parsed) return false;
  useContentCache.getState().setRemote(remote);
  applyContent(parsed);
  return true;
}
