import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Browser-visible Entra login settings, from the shared .env (no NEXT_PUBLIC_ duplicates).
  // All public by design: ids only, no secrets.
  env: {
    NEXT_PUBLIC_ENTRA_TENANT_ID: process.env.ENTRA_TENANT_ID,
    NEXT_PUBLIC_ENTRA_TENANT_SUBDOMAIN: process.env.ENTRA_TENANT_SUBDOMAIN,
    NEXT_PUBLIC_ENTRA_CLIENT_ID: process.env.ENTRA_CLIENT_ID,
  },
};

export default nextConfig;
