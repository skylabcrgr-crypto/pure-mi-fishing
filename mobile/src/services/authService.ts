// Pure MI Fishing — Auth Service (Phase 7)
// ----------------------------------------------------------------------------
// Thin wrapper over Supabase Auth. Every function degrades gracefully when the
// backend is not configured (returns a structured "not configured" result
// instead of throwing). Accounts are OPTIONAL — the app works fully signed out.
// ----------------------------------------------------------------------------

import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthResult {
  ok: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
  notConfigured?: boolean;
}

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  notConfigured: true,
  error: 'Backend not configured',
};

/** True when Supabase env vars are present. */
export function isAuthConfigured(): boolean {
  return isSupabaseConfigured();
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return NOT_CONFIGURED;
  try {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: displayName ? { data: { display_name: displayName } } : undefined,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, user: data.user, session: data.session };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return NOT_CONFIGURED;
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true, user: data.user, session: data.session };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function signOut(): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return NOT_CONFIGURED;
  try {
    const { error } = await sb.auth.signOut();
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session ?? null;
  } catch {
    return null;
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return NOT_CONFIGURED;
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}
