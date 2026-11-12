import {
  type AccountInfo,
  InteractionRequiredAuthError,
  PublicClientApplication,
} from '@azure/msal-browser';

// Browser-side login: Microsoft Entra External ID (Google sign-in via its user flow), with
// MSAL's redirect flow (works on phones, where popups get blocked). The only module that
// talks to Entra in the browser; the rest of the app uses these functions (via
// hooks/use-auth.ts). Tenant and client ids are public by design.
const TENANT_ID = process.env.NEXT_PUBLIC_ENTRA_TENANT_ID ?? '';
const TENANT_SUBDOMAIN = process.env.NEXT_PUBLIC_ENTRA_TENANT_SUBDOMAIN ?? '';
const CLIENT_ID = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID ?? '';

// openid/profile give the ID token the user's object id and name; the token route checks it.
const SCOPES = ['openid', 'profile', 'email'];

export interface Learner {
  id: string; // Entra object id
  name: string;
}

let ready: Promise<PublicClientApplication> | null = null;
const listeners = new Set<(learner: Learner | null) => void>();

/** MSAL client, created once; also completes a login redirect that just returned here. */
function client(): Promise<PublicClientApplication> {
  ready ??= (async () => {
    const msal = new PublicClientApplication({
      auth: {
        clientId: CLIENT_ID,
        authority: `https://${TENANT_SUBDOMAIN}.ciamlogin.com/${TENANT_ID}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
      },
      cache: { cacheLocation: 'localStorage' }, // stay logged in across tabs and restarts
    });
    await msal.initialize();
    await msal.handleRedirectPromise();
    return msal;
  })();
  return ready;
}

function account(msal: PublicClientApplication): AccountInfo | null {
  return msal.getAllAccounts()[0] ?? null;
}

function toLearner(info: AccountInfo | null): Learner | null {
  if (!info) return null;
  return { id: info.localAccountId, name: info.name ?? info.username };
}

/** Leaves for the Entra sign-in page (Google); comes back to this page logged in. */
export async function logIn(): Promise<void> {
  const msal = await client();
  await msal.loginRedirect({ scopes: SCOPES });
}

/** Forgets the login in this browser only; the Google session itself stays. */
export async function signOut(): Promise<void> {
  const msal = await client();
  await msal.clearCache();
  listeners.forEach((onChange) => onChange(null));
}

/** Current ID token (renewed when expired), for the token route. */
export async function accessToken(): Promise<string | null> {
  const msal = await client();
  const current = account(msal);
  if (!current) return null;

  try {
    const result = await msal.acquireTokenSilent({ account: current, scopes: SCOPES });
    return result.idToken;
  } catch (err) {
    // Session expired at Entra: log in again rather than fail silently.
    if (err instanceof InteractionRequiredAuthError) await logIn();
    throw err;
  }
}

/** Calls `onChange` now and on every login/logout; returns an unsubscribe function. */
export function watchLearner(onChange: (learner: Learner | null) => void): () => void {
  listeners.add(onChange);
  client().then((msal) => onChange(toLearner(account(msal))));
  return () => listeners.delete(onChange);
}
