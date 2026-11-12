import { createRemoteJWKSet, jwtVerify } from 'jose';

// Verifies Entra External ID tokens on the server (token route). Entra signs ID tokens
// with keys published at the tenant's JWKS endpoint; jose caches the key set.
const TENANT_ID = process.env.ENTRA_TENANT_ID;
const TENANT_SUBDOMAIN = process.env.ENTRA_TENANT_SUBDOMAIN;
const CLIENT_ID = process.env.ENTRA_CLIENT_ID; // ID tokens are issued to the web app itself
// Evals sign in a test user headlessly (native auth) through a second app registration.
const EVAL_CLIENT_ID = process.env.ENTRA_EVAL_CLIENT_ID;

const BEARER_PREFIX = 'Bearer ';

const jwks =
  TENANT_ID && TENANT_SUBDOMAIN
    ? createRemoteJWKSet(
        new URL(`https://${TENANT_SUBDOMAIN}.ciamlogin.com/${TENANT_ID}/discovery/v2.0/keys`)
      )
    : null;

export interface VerifiedLearner {
  id: string; // Entra object id (oid); becomes the LiveKit identity the agent reads
  name: string;
}

/** The learner behind the request's `Authorization: Bearer <ID token>`, or null. */
export async function verifyLearner(req: Request): Promise<VerifiedLearner | null> {
  if (!jwks || !CLIENT_ID) {
    throw new Error('ENTRA_TENANT_ID, ENTRA_TENANT_SUBDOMAIN or ENTRA_CLIENT_ID is not defined');
  }

  const header = req.headers.get('authorization');
  if (!header?.startsWith(BEARER_PREFIX)) return null;

  try {
    const { payload } = await jwtVerify(header.slice(BEARER_PREFIX.length), jwks, {
      issuer: `https://${TENANT_ID}.ciamlogin.com/${TENANT_ID}/v2.0`,
      audience: [CLIENT_ID, EVAL_CLIENT_ID].filter((id): id is string => !!id),
    });
    if (typeof payload.oid !== 'string') return null;
    return { id: payload.oid, name: typeof payload.name === 'string' ? payload.name : '' };
  } catch {
    return null;
  }
}
