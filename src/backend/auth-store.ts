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
 * Creates an account. An anonymous user is upgraded in place, so their synced history stays with
 * them; otherwise a new account is made.
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'Accounts are not available in this build.' };
  const { data } = await supabase.auth.getSession();
  const result = data.session?.user.is_anonymous
    ? await supabase.auth.updateUser({ email, password })
    : await supabase.auth.signUp({ email, password });
  if (result.error) return { ok: false, error: friendly(result.error.message) };
  const user = result.data.user;
  return { ok: true, needsConfirmation: !!user && !user.email_confirmed_at };
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
