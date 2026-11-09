import { type Session, createClient } from '@supabase/supabase-js';

// Browser-side Supabase Auth: magic-link login. The only module that talks to Supabase
// in the browser; the rest of the app uses these functions (via hooks/use-auth.ts).
// The publishable key is public by design; data access is limited by row-level security.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''
);

export interface Learner {
  id: string;
  email: string;
}

function toLearner(session: Session | null): Learner | null {
  if (!session) return null;
  return { id: session.user.id, email: session.user.email ?? '' };
}

/** Emails a login link that returns to this page. */
export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** Current access token (refreshed when near expiry), for the token route. */
export async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Calls `onChange` now and on every login/logout; returns an unsubscribe function. */
export function watchLearner(onChange: (learner: Learner | null) => void): () => void {
  supabase.auth.getSession().then(({ data }) => onChange(toLearner(data.session)));
  const { data } = supabase.auth.onAuthStateChange((_event, session) =>
    onChange(toLearner(session))
  );
  return () => data.subscription.unsubscribe();
}
