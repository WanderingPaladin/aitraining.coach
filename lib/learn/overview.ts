import { COURSE_JOURNEY, COURSE_TITLE, LEARN_PATH, MODULES } from './course';
import { progressPercent, type LocalLearnState } from './storage';

export type CoursePhase =
  | 'not_started'
  | 'in_progress'
  | 'assessment_ready'
  | 'assessment_in_progress'
  | 'failed'
  | 'passed';

export type CoursePrimaryAction = {
  label: string;
  href: string;
  phase: CoursePhase;
};

export function completedModuleCount(state: LocalLearnState) {
  return MODULES.filter((item) => state.completedModules.includes(item.n)).length;
}

export function courseMinutes() {
  return MODULES.reduce((sum, item) => sum + item.duration, 0);
}

export function nextIncompleteModule(state: LocalLearnState) {
  return MODULES.find((item) => !state.completedModules.includes(item.n)) ?? null;
}

export function coursePhase(state: LocalLearnState): CoursePhase {
  if (state.passed && state.resultId) return 'passed';
  if (state.resultId) return 'failed';
  if (state.attemptId && !state.resultId) return 'assessment_in_progress';
  if (completedModuleCount(state) >= MODULES.length) return 'assessment_ready';
  if (state.startedModules.length > 0 || state.completedModules.length > 0) return 'in_progress';
  return 'not_started';
}

export type JourneyStepState = 'complete' | 'current' | 'upcoming';

export function courseJourneyStates(state: LocalLearnState) {
  const phase = coursePhase(state);
  const learnComplete = completedModuleCount(state) >= MODULES.length;
  const learnCurrent = !learnComplete && (state.startedModules.length > 0 || state.completedModules.length > 0);
  const practiceComplete = (state.completedLabs?.length ?? 0) > 0;
  const assessmentComplete = Boolean(state.resultId);
  const assessmentCurrent = phase === 'assessment_ready' || phase === 'assessment_in_progress';
  const certificateComplete = Boolean(state.passed && state.resultId);
  const byId: Record<string, JourneyStepState> = {
    Learn: learnComplete ? 'complete' : learnCurrent ? 'current' : 'upcoming',
    Practice: practiceComplete ? 'complete' : learnComplete && !assessmentCurrent && !assessmentComplete ? 'current' : 'upcoming',
    Assessment: assessmentComplete ? 'complete' : assessmentCurrent ? 'current' : 'upcoming',
    Results: assessmentComplete ? 'complete' : 'upcoming',
    Certificate: certificateComplete ? 'complete' : 'upcoming',
  };
  return COURSE_JOURNEY.map((label) => ({
    label,
    status: byId[label] ?? 'upcoming',
  }));
}

export function getCoursePrimaryAction(state: LocalLearnState): CoursePrimaryAction {
  const phase = coursePhase(state);
  if (phase === 'passed' && state.resultId) {
    return { label: 'View certificate →', href: LEARN_PATH.results(state.resultId), phase };
  }
  if (phase === 'failed' && state.resultId) {
    return { label: 'View results', href: LEARN_PATH.results(state.resultId), phase };
  }
  if (phase === 'assessment_in_progress') {
    return { label: 'Continue assessment →', href: LEARN_PATH.assessment, phase };
  }
  if (phase === 'assessment_ready') {
    return { label: 'Take final assessment →', href: LEARN_PATH.assessment, phase };
  }
  if (phase === 'in_progress') {
    const next = nextIncompleteModule(state);
    return {
      label: 'Continue course →',
      href: next ? LEARN_PATH.module(next.n) : LEARN_PATH.course,
      phase,
    };
  }
  return { label: 'Start free course →', href: LEARN_PATH.module(1), phase };
}

export function courseOverviewCopy() {
  return {
    eyebrow: 'AI Training Foundations',
    title: COURSE_TITLE,
    description:
      'Learn how to evaluate AI responses professionally through structured lessons, practice, and a final readiness assessment.',
    badge: 'Beginner friendly',
    disclaimer:
      'Course completion does not guarantee employment, third-party platform acceptance, projects, or income.',
  };
}

export { progressPercent };
