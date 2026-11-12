'use client';

import { useMemo } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { LoginView } from '@/components/app/login-view';
import { TutorLayout } from '@/components/app/tutor-layout';
import { Toaster } from '@/components/ui/sonner';
import { AuthState, useAuth } from '@/hooks/use-auth';
import { useLevel } from '@/hooks/use-level';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { accessToken } from '@/lib/auth';
import { toAgentMetadata } from '@/lib/tutor-level';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

// How long to wait for the agent to join. LiveKit Cloud's free plan puts an idle agent to
// sleep; waking it takes 10–20 s plus model loading, past the SDK's 20 s default.
const AGENT_JOIN_TIMEOUT_MS = 90_000;

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  tokenServerId?: string;
  tokenEndpoint: string;
  agentName?: string;
}

/** Token endpoint call carrying the learner's current Entra ID token. */
function authedTokenSource(tokenEndpoint: string) {
  return TokenSource.custom(async (options) => {
    const token = await accessToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    return TokenSource.endpoint(tokenEndpoint, { headers }).fetch(options);
  });
}

/** Login first: the token route only serves logged-in learners. */
export function App(props: AppProps) {
  const { state } = useAuth();

  if (state === AuthState.LoggedIn) return <TutorApp {...props} />;
  return (
    <main className="grid h-svh place-content-center">
      {state === AuthState.LoggedOut && <LoginView />}
    </main>
  );
}

function TutorApp({ tokenServerId, tokenEndpoint, agentName }: AppProps) {
  const tokenSource = useMemo(
    () =>
      tokenServerId
        ? TokenSource.developmentTokenServer(tokenServerId)
        : authedTokenSource(tokenEndpoint),
    [tokenServerId, tokenEndpoint]
  );

  const [level, setLevel] = useLevel();
  const session = useSession(
    tokenSource,
    agentName
      ? {
          agentName,
          agentMetadata: toAgentMetadata(level),
          agentConnectTimeoutMilliseconds: AGENT_JOIN_TIMEOUT_MS,
        }
      : undefined
  );

  return (
    <AgentSessionProvider session={session}>
      <AppSetup />
      <TutorLayout level={level} onLevelChange={setLevel} />
      <StartAudioButton label="Start Audio" />
      <Toaster
        icons={{
          warning: <WarningIcon weight="bold" />,
        }}
        position="top-center"
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
      />
    </AgentSessionProvider>
  );
}
