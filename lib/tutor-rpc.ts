import type { Room } from 'livekit-client';
import type { ModeRequest, WeakWord } from '@/lib/tutor-drill';
import type { LessonContext, SessionSummary } from '@/lib/tutor-feedback';

/** Mirrors agent/costs.py `CostBreakdown` (USD). */
export interface CostBreakdown {
  minutes: number;
  claude: number;
  deepgram: number;
  cartesia: number;
  azure: number;
  livekit: number;
  total: number;
  per_minute: number;
}

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
const RPC_LESSON_CONTEXT = 'lesson_context';
const RPC_SET_LESSON_MODE = 'set_lesson_mode';
const RPC_WORD_SCORES = 'word_scores';
const RPC_SESSION_COST = 'session_cost';
const RPC_REPLAY_SLOW = 'replay_slow';
const RPC_TRANSLATE = 'translate_line';

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

  /** Due words and recent mistakes the session opened with. */
  async lessonContext(): Promise<LessonContext> {
    return JSON.parse(await this.#call(RPC_LESSON_CONTEXT)) as LessonContext;
  }

  /** Switches conversation / role-play / drills; the tutor speaks first in the new mode. */
  setLessonMode(request: ModeRequest): Promise<string> {
    return this.#call(RPC_SET_LESSON_MODE, JSON.stringify(request));
  }

  /** Lowest average drill scores per word (last 30 days). */
  async wordScores(): Promise<WeakWord[]> {
    return JSON.parse(await this.#call(RPC_WORD_SCORES)) as WeakWord[];
  }

  /** Running cost of this call (USD). */
  async sessionCost(): Promise<CostBreakdown> {
    return JSON.parse(await this.#call(RPC_SESSION_COST)) as CostBreakdown;
  }

  /** The tutor says `line` again, slowly. */
  replaySlow(line: string): Promise<string> {
    return this.#call(RPC_REPLAY_SLOW, line);
  }

  /** English translation of a tutor line. */
  translate(line: string): Promise<string> {
    return this.#call(RPC_TRANSLATE, line);
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
