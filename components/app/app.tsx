'use client';

import { useMemo } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { FeedbackPanel } from '@/components/app/feedback-panel';
import { LevelPicker } from '@/components/app/level-picker';
import { LoginView } from '@/components/app/login-view';
import { PushToTalkControls } from '@/components/app/push-to-talk';
import { ViewController } from '@/components/app/view-controller';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { AuthState, useAuth } from '@/hooks/use-auth';
import { useLevel } from '@/hooks/use-level';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { accessToken, signOut } from '@/lib/auth';
import { toAgentMetadata } from '@/lib/tutor-level';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  tokenServerId?: string;
  tokenEndpoint: string;
  agentName?: string;
  isVideoInputSupported: boolean;
}

/** Token endpoint call carrying the learner's current Supabase access token. */
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

function TutorApp({ tokenServerId, tokenEndpoint, agentName, isVideoInputSupported }: AppProps) {
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
    agentName ? { agentName, agentMetadata: toAgentMetadata(level) } : undefined
  );

  return (
    <AgentSessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController isVideoInputSupported={isVideoInputSupported} />
        <PushToTalkControls className="fixed top-4 left-1/2 z-50 -translate-x-1/2" />
        <LevelPicker
          level={level}
          onLevelChange={setLevel}
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
        />
        <FeedbackPanel className="fixed top-20 right-4 bottom-36 z-40 hidden w-72 xl:flex" />
        <Button size="xs" variant="ghost" onClick={signOut} className="fixed top-4 left-4 z-50">
          Log out
        </Button>
      </main>
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
