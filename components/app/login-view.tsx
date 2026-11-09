'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendMagicLink } from '@/lib/auth';

enum Step {
  Email = 'email',
  Sending = 'sending',
  Sent = 'sent',
}

/** Magic-link login: the tutor remembers your words and mistakes per account. */
export function LoginView() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(Step.Email);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStep(Step.Sending);
    setError(null);
    try {
      await sendMagicLink(email);
      setStep(Step.Sent);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStep(Step.Email);
    }
  }

  if (step === Step.Sent) {
    return (
      <section className="flex flex-col items-center gap-2 px-4 text-center">
        <p className="font-medium">Check your email</p>
        <p className="text-muted-foreground text-sm">
          Open the link sent to {email} in this browser.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-72 flex-col items-center gap-3 px-4 text-center">
      <p className="font-medium">Log in to your Spanish tutor</p>
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={step === Step.Sending} className="w-full">
        {step === Step.Sending ? 'Sending…' : 'Email me a login link'}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </form>
  );
}
