import type { Room } from 'livekit-client';

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

  #call(method: string, payload = ''): Promise<string> {
    return this.#room.localParticipant.performRpc({
      destinationIdentity: this.#agentIdentity,
      method,
      payload,
    });
  }
}
