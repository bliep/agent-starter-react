import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Browser-visible Supabase settings, from the shared .env (no NEXT_PUBLIC_ duplicates).
  // Both are public by design: the publishable key only allows what row-level security does.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  },
};

export default nextConfig;
