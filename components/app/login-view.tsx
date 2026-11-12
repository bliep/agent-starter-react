'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { logIn } from '@/lib/auth';

/** Google login (via Entra): the tutor remembers your words and mistakes per account. */
export function LoginView() {
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLeaving(true);
    setError(null);
    try {
      await logIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLeaving(false);
    }
  }

  return (
    <section className="flex w-72 flex-col items-center gap-3 px-4 text-center">
      <p className="font-medium">Log in to your Spanish tutor</p>
      <Button onClick={start} disabled={leaving} className="w-full">
        {leaving ? 'Opening…' : 'Continue with Google'}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </section>
  );
}
