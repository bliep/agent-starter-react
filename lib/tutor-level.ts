/** CEFR level. Values must match agent/prompts.py `Level`. */
export enum Level {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
}

export const DEFAULT_LEVEL = Level.A1;

export const LEVEL_LABELS: Record<Level, string> = {
    [Level.A1]: 'A1 · Beginner',
    [Level.A2]: 'A2 · Elementary',
    [Level.B1]: 'B1 · Intermediate',
    [Level.B2]: 'B2 · Upper intermediate',
    [Level.C1]: 'C1 · Advanced',
};

// Dispatch metadata key read by agent/main.py `read_level`.
const LEVEL_KEY = 'level';

/** Agent dispatch metadata, e.g. '{"level":"B1"}'. */
export function toAgentMetadata(level: Level): string {
    return JSON.stringify({ [LEVEL_KEY]: level });
}

export function parseLevel(value: string | null): Level {
    return Object.values(Level).includes(value as Level) ? (value as Level) : DEFAULT_LEVEL;
}
