import type { Room } from 'livekit-client';

// Text stream topic the agent publishes feedback on (agent/main.py FEEDBACK_TOPIC).
const FEEDBACK_TOPIC = 'tutor.feedback';

/** Mirrors agent/feedback.py `UserLanguage`. */
export enum UserLanguage {
  Spanish = 'es',
  English = 'en',
  Mixed = 'mixed',
}

/** Mirrors agent/feedback.py `ErrorCategory`. */
export enum ErrorCategory {
  SerEstar = 'ser_estar',
  Agreement = 'agreement',
  PreteriteImperfect = 'preterite_imperfect',
  Conjugation = 'conjugation',
  Preposition = 'preposition',
  WordChoice = 'word_choice',
  Other = 'other',
}

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  [ErrorCategory.SerEstar]: 'ser / estar',
  [ErrorCategory.Agreement]: 'gender & number',
  [ErrorCategory.PreteriteImperfect]: 'preterite / imperfect',
  [ErrorCategory.Conjugation]: 'conjugation',
  [ErrorCategory.Preposition]: 'prepositions',
  [ErrorCategory.WordChoice]: 'word choice',
  [ErrorCategory.Other]: 'other',
};

/** Mirrors agent/feedback.py `Correction`. */
export interface Correction {
  original: string;
  corrected: string;
  rule: string;
  category: ErrorCategory;
}

/** Mirrors agent/feedback.py `VocabItem`. */
export interface VocabItem {
  spanish: string;
  english: string;
}

/** Mirrors agent/feedback.py `Feedback` (the record_feedback payload). */
export interface Feedback {
  corrections: Correction[];
  new_vocab: VocabItem[];
  english_gloss: string;
  user_language: UserLanguage;
}

/** Mirrors agent/feedback_channel.py `FeedbackMessage`. */
export interface FeedbackMessage {
  turn_id: string;
  learner: string;
  feedback: Feedback;
}

/** Mirrors agent/summary.py `Pattern`. */
export interface Pattern {
  title: string;
  explanation: string;
  examples: string[];
}

/** Mirrors agent/summary.py `SessionSummary` (session_summary RPC result). */
export interface SessionSummary {
  patterns: Pattern[];
  encouragement: string;
  new_words: VocabItem[];
}

/** Mirrors agent/learner_model.py `RecentError`. */
export interface RecentError {
  category: ErrorCategory;
  count: number;
  original: string;
  corrected: string;
}

/** Mirrors agent/learner_model.py `LessonContext` (lesson_context RPC result). */
export interface LessonContext {
  due_words: VocabItem[];
  recent_errors: RecentError[];
}

/** Calls `onMessage` for each feedback message; returns an unsubscribe function. */
export function subscribeFeedback(
  room: Room,
  onMessage: (message: FeedbackMessage) => void
): () => void {
  room.registerTextStreamHandler(FEEDBACK_TOPIC, async (reader) => {
    try {
      onMessage(JSON.parse(await reader.readAll()) as FeedbackMessage);
    } catch (error) {
      console.warn('Ignoring malformed feedback message', error);
    }
  });
  return () => room.unregisterTextStreamHandler(FEEDBACK_TOPIC);
}
