import course from './data/course-v2.json';

export const COURSE_SLUG = 'ai-training-foundations';
export const COURSE_TITLE = 'AI Training Foundations';
export const PASS_SCORE = course.certificateThreshold;
export const MODULE_COUNT = course.modules.length;

export const MODULES = course.modules.map((item) => ({
  n: item.id,
  title: item.title,
  minutes: `${item.minutes} min`,
  duration: item.minutes,
  slug: item.slug,
  summary: item.outcomes[0] ?? '',
  outcomes: item.outcomes,
}));

export const COURSE_JOURNEY = course.journey;

/** Matches backend SCORE_WEIGHTS in aitraining.coach_backend/src/modules/learn/questions.ts */
export const ASSESSMENT_WEIGHTS = [
  { key: 'instruction_following', label: 'Instruction following', weight: 0.25 },
  { key: 'response_evaluation', label: 'Response evaluation', weight: 0.25 },
  { key: 'factuality', label: 'Factuality & research', weight: 0.2 },
  { key: 'written_reasoning', label: 'Written reasoning', weight: 0.2 },
  { key: 'attention_to_detail', label: 'Attention to detail', weight: 0.1 },
] as const;

/** Matches backend ATTEMPT_QUESTION_COUNT + ATTEMPT_PRACTICAL_COUNT. Display only. */
export const ASSESSMENT_ITEM_COUNT = 26;

export const LEARN_PATH = {
  landing: '/learn',
  course: '/learn/ai-training-foundations',
  module: (n: number) => `/learn/ai-training-foundations/module/${n}`,
  practice: '/learn/ai-training-foundations/practice',
  lab: (id: string) => `/learn/ai-training-foundations/practice/${id}`,
  assessment: '/learn/ai-training-foundations/assessment',
  results: (id: string) => `/learn/ai-training-foundations/results/${id}`,
  certificate: (id: string) => `/certificate/${id}`,
} as const;
