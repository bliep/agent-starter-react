'use client';

import { useEffect, useState } from 'react';
import { type Learner, watchLearner } from '@/lib/auth';

/** Login state while the page checks for a stored session. */
export enum AuthState {
  Loading = 'loading',
  LoggedOut = 'logged-out',
  LoggedIn = 'logged-in',
}

/** The logged-in learner, if any. */
export function useAuth(): { state: AuthState; learner: Learner | null } {
  const [learner, setLearner] = useState<Learner | null>(null);
  const [state, setState] = useState(AuthState.Loading);

  useEffect(
    () =>
      watchLearner((next) => {
        setLearner(next);
        setState(next ? AuthState.LoggedIn : AuthState.LoggedOut);
      }),
    []
  );

  return { state, learner };
}
