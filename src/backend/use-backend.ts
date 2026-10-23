import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useHistoryStore } from '@/session/history';

import { signInAnonymously, useAuthStore } from './auth-store';
import { supabase } from './client';
import { applyCachedContent, refreshContent, useContentCache } from './content-cache';
import { pullJournal, syncNow } from './sync';

const quietly = (promise: Promise<unknown>) => promise.catch(() => undefined);

/**
 * Starts the optional backend: applies cached content, refreshes it, signs the device in
 * anonymously, and keeps local data synced when the app is active or a session ends.
 */
export function useBackend() {
  useEffect(() => {
    const applyCache = () => applyCachedContent();
    if (useContentCache.persist.hasHydrated()) applyCache();
    const unsubHydration = useContentCache.persist.onFinishHydration(applyCache);
    void quietly(refreshContent());

    if (!supabase) return unsubHydration;
    const auth = supabase.auth;

    void quietly(
      auth.getSession().then(async ({ data }) => {
        useAuthStore.getState().setFromSession(data.session);
        if (!data.session) await signInAnonymously();
        await syncNow();
      }),
    );

    const { data: listener } = auth.onAuthStateChange((event, session) => {
      useAuthStore.getState().setFromSession(session);
      if (event === 'SIGNED_IN' && session && !session.user.is_anonymous) {
        // Supabase calls this while holding its auth lock; calling back into Supabase here would
        // deadlock, so the follow-up work runs on the next tick.
        setTimeout(() => void quietly(pullJournal().then(syncNow)), 0);
      }
    });

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void quietly(syncNow());
    });

    // A finished session is a natural moment to upload.
    const unsubHistory = useHistoryStore.subscribe((state, prev) => {
      if (state.sessions.length !== prev.sessions.length) void quietly(syncNow());
    });

    return () => {
      unsubHydration();
      listener.subscription.unsubscribe();
      appState.remove();
      unsubHistory();
    };
  }, []);
}
