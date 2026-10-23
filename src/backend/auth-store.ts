import type { Session as AuthSession } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from './client';

export type AuthStatus = 'disabled' | 'loading' | 'anonymous' | 'signed-in' | 'signed-out';

type AuthStore = {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  setFromSession: (session: AuthSession | null) => void;
};

export const useAuthStore = create<AuthStore>()((set) => ({
  status: supabase ? 'loading' : 'disabled',
  userId: null,
  email: null,
  setFromSession: (session) => {
    if (!session) {
      set({ status: 'signed-out', userId: null, email: null });
      return;
    }
    const user = session.user;
    set({
      status: user.is_anonymous ? 'anonymous' : 'signed-in',
      userId: user.id,
      email: user.email ?? null,
    });
  },
}));

const friendly = (message: string): string => {
  if (/invalid login credentials/i.test(message)) return 'That email and password don’t match.';
  if (/already (been )?registered|already exists/i.test(message)) return 'An account with this email already exists. Try signing in.';
  if (/password/i.test(message) && /least|short|weak/i.test(message)) return 'Please use a password of at least 8 characters.';
  if (/network|fetch/i.test(message)) return 'Can’t reach the server. Check your connection and try again.';
  return message;
};

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; error: string };

/**
 * Creates an email account. A guest's journal comes along because the device uploads it again once
 * the new account is signed in (see `syncNow`).
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'Accounts are not available in this build.' };
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: friendly(error.message) };
  // With email confirmation on, Supabase hides whether an address is taken by returning a user
  // with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, error: 'An account with this email already exists. Try signing in.' };
  }
  return { ok: true, needsConfirmation: !data.session };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'Accounts are not available in this build.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true };
}

export async function signInAnonymously(): Promise<void> {
  if (!supabase) return;
  // Fails quietly when anonymous sign-ins are disabled for the project; the app still works offline.
  await supabase.auth.signInAnonymously().catch(() => undefined);
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
