import { createRemoteJWKSet, jwtVerify } from 'jose';

// Verifies Supabase access tokens on the server (token route). Supabase signs them with
// an asymmetric key published at SUPABASE_JWKS_URL; jose caches the key set.
const SUPABASE_URL = process.env.SUPABASE_URL;
const JWKS_URL = process.env.SUPABASE_JWKS_URL;
const AUDIENCE = 'authenticated'; // Supabase audience for logged-in users

const BEARER_PREFIX = 'Bearer ';

const jwks = JWKS_URL ? createRemoteJWKSet(new URL(JWKS_URL)) : null;

export interface VerifiedLearner {
  id: string; // Supabase user id; becomes the LiveKit identity the agent reads
  email: string;
}

/** The learner behind the request's `Authorization: Bearer <token>`, or null. */
export async function verifyLearner(req: Request): Promise<VerifiedLearner | null> {
  if (!jwks || !SUPABASE_URL) {
    throw new Error('SUPABASE_URL or SUPABASE_JWKS_URL is not defined');
  }

  const header = req.headers.get('authorization');
  if (!header?.startsWith(BEARER_PREFIX)) return null;

  try {
    const { payload } = await jwtVerify(header.slice(BEARER_PREFIX.length), jwks, {
      issuer: `${SUPABASE_URL}/auth/v1`,
      audience: AUDIENCE,
    });
    if (!payload.sub) return null;
    return { id: payload.sub, email: typeof payload.email === 'string' ? payload.email : '' };
  } catch {
    return null;
  }
}
