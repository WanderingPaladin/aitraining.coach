import { COURSE_SLUG, MODULES } from './course';

const KEY = `ait.learn.${COURSE_SLUG}.v2`;

export const LAB_PROGRESS_PREFIX = 'lab:';

export type LocalLearnState = {
  currentModule: number;
  completedModules: number[];
  startedModules: number[];
  completedLabs: string[];
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
    completedLabs: [],
    quizResults: {},
    lastLesson: null,
    attemptId: null,
    answers: {},
    resultId: null,
    passed: false,
  };
}

export function uniqueLabs(values: string[] | undefined) {
  return [...new Set((values ?? []).map((item) => String(item).trim()).filter(Boolean))];
}

export function labsFromQuizResults(quizResults: Record<string, boolean | number | string> | null | undefined) {
  return uniqueLabs(
    Object.entries(quizResults ?? {})
      .filter(([key, value]) => key.startsWith(LAB_PROGRESS_PREFIX) && (value === true || value === 'true' || value === 1))
      .map(([key]) => key.slice(LAB_PROGRESS_PREFIX.length)),
  );
}

export function quizResultsWithoutLabs(quizResults: Record<string, boolean>) {
  return Object.fromEntries(
    Object.entries(quizResults).filter(([key]) => !key.startsWith(LAB_PROGRESS_PREFIX)),
  );
}

export function quizResultsWithLabs(quizResults: Record<string, boolean>, labs: string[]) {
  const next = quizResultsWithoutLabs(quizResults);
  for (const slug of uniqueLabs(labs)) next[`${LAB_PROGRESS_PREFIX}${slug}`] = true;
  return next;
}

function normalizeState(raw: Partial<LocalLearnState>): LocalLearnState {
  const base = { ...emptyLearnState(), ...raw };
  const quizResults = asQuizResults(base.quizResults);
  const completedLabs = uniqueLabs([...(raw.completedLabs ?? []), ...labsFromQuizResults(quizResults)]);
  return {
    ...base,
    quizResults: quizResultsWithLabs(quizResults, completedLabs),
    completedLabs,
    completedModules: uniqueSorted(base.completedModules ?? []),
    startedModules: uniqueSorted(base.startedModules ?? []),
  };
}

export function readLearnState(): LocalLearnState {
  if (typeof window === 'undefined') return emptyLearnState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyLearnState();
    return normalizeState(JSON.parse(raw) as Partial<LocalLearnState>);
  } catch {
    return emptyLearnState();
  }
}

export function writeLearnState(patch: Partial<LocalLearnState>): LocalLearnState {
  const current = readLearnState();
  const next = normalizeState({
    ...current,
    ...patch,
    quizResults: patch.quizResults ?? current.quizResults,
    completedLabs: patch.completedLabs ?? current.completedLabs,
  });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode
  }
  return next;
}

function uniqueSorted(values: number[]) {
  return [...new Set(values.filter((value) => value >= 1 && value <= 8))].sort((a, b) => a - b);
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
    completedLabs?: string[];
    quizResults?: unknown;
    lastLesson?: string | null;
  } | null,
): LocalLearnState {
  if (!remote) return local;
  const remoteQuiz = asQuizResults(remote.quizResults);
  const completedLabs = uniqueLabs([
    ...(local.completedLabs ?? []),
    ...(remote.completedLabs ?? []),
    ...labsFromQuizResults(remoteQuiz),
    ...labsFromQuizResults(local.quizResults),
  ]);
  return normalizeState({
    ...local,
    currentModule: Math.max(local.currentModule || 1, remote.currentModule || 1),
    completedModules: uniqueSorted([...(local.completedModules ?? []), ...(remote.completedModules ?? [])]),
    startedModules: uniqueSorted([...(local.startedModules ?? []), ...(remote.startedModules ?? [])]),
    completedLabs,
    quizResults: { ...remoteQuiz, ...local.quizResults },
    lastLesson: local.lastLesson ?? remote.lastLesson ?? null,
  });
}

export function isLabComplete(state: LocalLearnState, labId: string) {
  return state.completedLabs.includes(labId);
}

export function markLabCompleteLocal(state: LocalLearnState, labId: string) {
  return uniqueLabs([...(state.completedLabs ?? []), labId]);
}

export function progressPercent(state: { completedModules: number[] }) {
  const total = MODULES.length || 1;
  const completed = uniqueSorted(state.completedModules ?? []);
  const raw = Math.round((completed.length / total) * 100);
  if (!Number.isFinite(raw)) return 0;
  return Math.min(100, Math.max(0, raw));
}

export function moduleStatus(state: LocalLearnState, n: number): 'complete' | 'in_progress' | 'not_started' {
  if (state.completedModules.includes(n)) return 'complete';
  if (state.startedModules.includes(n) || state.currentModule === n) return 'in_progress';
  return 'not_started';
}

export function continueHref(state: LocalLearnState) {
  if (state.resultId) return `/learn/ai-training-foundations/results/${state.resultId}`;
  if (state.completedModules.length >= MODULES.length) return '/learn/ai-training-foundations/assessment';
  const next = MODULES.find((item) => !state.completedModules.includes(item.n));
  return `/learn/ai-training-foundations/module/${next?.n ?? 1}`;
}
