import course from './data/course-v2.json';

export const COURSE_SLUG = 'ai-training-foundations';
export const COURSE_TITLE = 'AI Training Foundations';
export const PASS_SCORE = 75;
export const MODULE_COUNT = 8;

export const MODULES = course.modules.map((item) => ({
  n: item.id,
  title: item.title,
  minutes: `${item.minutes} min`,
  duration: item.minutes,
  slug: item.slug,
}));

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
