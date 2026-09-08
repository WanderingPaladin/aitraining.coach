import scenarios from './data/practical-scenarios.json';
import { LEARN_PATH, MODULES } from './course';
import { completedModuleCount, nextIncompleteModule } from './overview';
import { type LocalLearnState } from './storage';

export type LearningStepType = 'module' | 'practice' | 'assessment' | 'results' | 'course';

export type LearningStep = {
  type: LearningStepType;
  id: string;
  href: string;
  title: string;
  n?: number;
};

export type LearningAction = LearningStep & {
  label: string;
};

export function labSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function practiceLabs() {
  const labs: Array<{ id: string; title: string }> = [];
  const seen = new Set<string>();
  for (const item of scenarios.scenarios) {
    const id = labSlug(item.lab);
    if (seen.has(id)) continue;
    seen.add(id);
    labs.push({ id, title: item.lab });
  }
  return labs;
}

export function learningSequence(): LearningStep[] {
  return [
    ...MODULES.map((item) => ({
      type: 'module' as const,
      id: String(item.n),
      n: item.n,
      title: item.title,
      href: LEARN_PATH.module(item.n),
    })),
    ...practiceLabs().map((lab) => ({
      type: 'practice' as const,
      id: lab.id,
      title: lab.title,
      href: LEARN_PATH.lab(lab.id),
    })),
    {
      type: 'assessment' as const,
      id: 'assessment',
      title: 'Final Readiness Assessment',
      href: LEARN_PATH.assessment,
    },
  ];
}

export function findLearningStep(currentType: LearningStepType, currentId: string) {
  const sequence = learningSequence();
  if (currentType === 'practice') {
    return sequence.find((item) => item.type === 'practice' && item.id === currentId) ?? null;
  }
  if (currentType === 'module') {
    return sequence.find((item) => item.type === 'module' && item.id === String(currentId)) ?? null;
  }
  if (currentType === 'assessment') {
    return sequence.find((item) => item.type === 'assessment') ?? null;
  }
  return null;
}

export function assessmentAction(state: LocalLearnState): LearningAction {
  if (state.passed && state.resultId) {
    return {
      type: 'results',
      id: state.resultId,
      title: 'Certificate',
      href: LEARN_PATH.results(state.resultId),
      label: 'View certificate →',
    };
  }
  if (state.resultId) {
    return {
      type: 'results',
      id: state.resultId,
      title: 'Results',
      href: LEARN_PATH.results(state.resultId),
      label: 'View results →',
    };
  }
  if (state.attemptId && !state.resultId) {
    return {
      type: 'assessment',
      id: 'assessment',
      title: 'Final Readiness Assessment',
      href: LEARN_PATH.assessment,
      label: 'Continue assessment →',
    };
  }
  if (completedModuleCount(state) >= MODULES.length) {
    return {
      type: 'assessment',
      id: 'assessment',
      title: 'Final Readiness Assessment',
      href: LEARN_PATH.assessment,
      label: 'Take final assessment →',
    };
  }
  const nextModule = nextIncompleteModule(state);
  if (nextModule) {
    return {
      type: 'module',
      id: String(nextModule.n),
      n: nextModule.n,
      title: nextModule.title,
      href: LEARN_PATH.module(nextModule.n),
      label: `Continue to Module ${nextModule.n} →`,
    };
  }
  return {
    type: 'course',
    id: 'course',
    title: 'Course overview',
    href: LEARN_PATH.course,
    label: 'Back to course overview →',
  };
}

export function getNextLearningStep(input: {
  currentType: LearningStepType;
  currentId: string;
  state: LocalLearnState;
}): LearningAction {
  if (input.currentType === 'module') {
    const currentN = Number(input.currentId);
    const nextModule = MODULES.find((item) => item.n === currentN + 1);
    if (nextModule) {
      return {
        type: 'module',
        id: String(nextModule.n),
        n: nextModule.n,
        title: nextModule.title,
        href: LEARN_PATH.module(nextModule.n),
        label: `Continue to Module ${nextModule.n} →`,
      };
    }
    const completedModules = state.completedModules.includes(currentN)
      ? state.completedModules
      : [...state.completedModules, currentN];
    return assessmentAction({ ...state, completedModules });
  }

  if (input.currentType === 'practice') {
    const labs = practiceLabs();
    const index = labs.findIndex((item) => item.id === input.currentId);
    const nextLab = index >= 0 ? labs[index + 1] : null;
    if (nextLab) {
      return {
        type: 'practice',
        id: nextLab.id,
        title: nextLab.title,
        href: LEARN_PATH.lab(nextLab.id),
        label: 'Continue to next lab →',
      };
    }
    return assessmentAction(input.state);
  }

  return assessmentAction(input.state);
}

export function getPrevLearningStep(input: {
  currentType: LearningStepType;
  currentId: string;
}): LearningStep {
  const sequence = learningSequence();
  const current = findLearningStep(input.currentType, input.currentId);
  const index = current ? sequence.findIndex((item) => item.type === current.type && item.id === current.id) : -1;
  const prev = index > 0 ? sequence[index - 1] : null;
  if (prev) return prev;
  return {
    type: 'course',
    id: 'course',
    title: 'Course overview',
    href: LEARN_PATH.course,
  };
}

export function courseBackAction() {
  return { href: LEARN_PATH.course, label: '← Back to course' };
}
