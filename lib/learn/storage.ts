import { COURSE_SLUG, MODULES } from './course';

const KEY = `ait.learn.${COURSE_SLUG}.v1`;

export type LocalLearnState = {
  currentModule: number;
  completedModules: number[];
  startedModules: number[];
  quizResults: Record<string, boolean>;
  lastLesson: string | null;
  attemptId: string | null;
  answers: Record<string, string>;
  resultId: string | null;
  passed: boolean;
};

export function emptyLearnState(): LocalLearnState {
  return {
    currentModule: 1,
    completedModules: [],
    startedModules: [],
    quizResults: {},
    lastLesson: null,
    attemptId: null,
    answers: {},
    resultId: null,
    passed: false,
  };
}

export function readLearnState(): LocalLearnState {
  if (typeof window === 'undefined') return emptyLearnState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyLearnState();
    return { ...emptyLearnState(), ...(JSON.parse(raw) as Partial<LocalLearnState>) };
  } catch {
    return emptyLearnState();
  }
}

export function writeLearnState(patch: Partial<LocalLearnState>): LocalLearnState {
  const next = { ...readLearnState(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode
  }
  return next;
}

function uniqueSorted(values: number[]) {
  return [...new Set(values.filter((value) => value >= 1 && value <= 6))].sort((a, b) => a - b);
}

function asQuizResults(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<string, boolean> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === 'boolean') out[key] = item;
  }
  return out;
}

export function mergeRemoteProgress(
  local: LocalLearnState,
  remote: {
    currentModule?: number;
    completedModules?: number[];
    startedModules?: number[];
    quizResults?: unknown;
    lastLesson?: string | null;
  } | null,
): Partial<LocalLearnState> {
  if (!remote) return local;
  return {
    currentModule: Math.max(local.currentModule || 1, remote.currentModule || 1),
    completedModules: uniqueSorted([...(local.completedModules ?? []), ...(remote.completedModules ?? [])]),
    startedModules: uniqueSorted([...(local.startedModules ?? []), ...(remote.startedModules ?? [])]),
    quizResults: { ...asQuizResults(remote.quizResults), ...local.quizResults },
    lastLesson: local.lastLesson ?? remote.lastLesson ?? null,
  };
}

export function progressPercent(state: { completedModules: number[] }) {
  return Math.round((state.completedModules.length / MODULES.length) * 100);
}

export function moduleStatus(state: LocalLearnState, n: number): 'complete' | 'in_progress' | 'not_started' {
  if (state.completedModules.includes(n)) return 'complete';
  if (state.startedModules.includes(n) || state.currentModule === n) return 'in_progress';
  return 'not_started';
}

export function continueHref(state: LocalLearnState) {
  if (state.resultId) return `/learn/ai-training-foundations/results/${state.resultId}`;
  if (state.completedModules.length >= 6) return '/learn/ai-training-foundations/assessment';
  const next = MODULES.find((item) => !state.completedModules.includes(item.n));
  return `/learn/ai-training-foundations/module/${next?.n ?? 1}`;
}
