import type { Room } from 'livekit-client';
import type { SessionSummary } from '@/lib/tutor-feedback';

/** Learner input mode. Values are the wire payloads the agent expects. */
export enum InputMode {
  Open = 'open',
  PushToTalk = 'ptt',
}

// RPC methods registered by the tutor agent (agent/main.py).
const RPC_SET_INPUT_MODE = 'set_input_mode';
const RPC_PTT_START = 'ptt_start';
const RPC_PTT_END = 'ptt_end';
const RPC_PTT_CANCEL = 'ptt_cancel';
const RPC_SESSION_SUMMARY = 'session_summary';

// The summary runs an LLM over the whole session (~5 s); the RPC default is shorter.
const SUMMARY_TIMEOUT_MS = 30_000;

/** Typed client for the tutor agent's RPC methods. */
export class TutorRpc {
  readonly #room: Room;
  readonly #agentIdentity: string;

  constructor(room: Room, agentIdentity: string) {
    this.#room = room;
    this.#agentIdentity = agentIdentity;
  }

  setInputMode(mode: InputMode): Promise<string> {
    return this.#call(RPC_SET_INPUT_MODE, mode);
  }

  startTurn(): Promise<string> {
    return this.#call(RPC_PTT_START);
  }

  endTurn(): Promise<string> {
    return this.#call(RPC_PTT_END);
  }

  cancelTurn(): Promise<string> {
    return this.#call(RPC_PTT_CANCEL);
  }

  async sessionSummary(): Promise<SessionSummary> {
    const json = await this.#call(RPC_SESSION_SUMMARY, '', SUMMARY_TIMEOUT_MS);
    return JSON.parse(json) as SessionSummary;
  }

  #call(method: string, payload = '', responseTimeout?: number): Promise<string> {
    return this.#room.localParticipant.performRpc({
      destinationIdentity: this.#agentIdentity,
      method,
      payload,
      responseTimeout,
    });
  }
}
