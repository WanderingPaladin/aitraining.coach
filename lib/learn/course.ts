export const COURSE_SLUG = 'ai-training-foundations';
export const COURSE_TITLE = 'AI Training Foundations';
export const PASS_SCORE = 75;

export const MODULES = [
  { n: 1, title: 'AI Training Basics', minutes: '5–7 min', duration: 7 },
  { n: 2, title: 'Evaluating AI Responses', minutes: '10 min', duration: 10 },
  { n: 3, title: 'Following Detailed Instructions', minutes: '10 min', duration: 10 },
  { n: 4, title: 'Factuality & Hallucinations', minutes: '10 min', duration: 10 },
  { n: 5, title: 'Writing Good Evaluation Feedback', minutes: '10 min', duration: 10 },
  { n: 6, title: 'Getting Started With AI-Training Work', minutes: '10 min', duration: 10 },
] as const;

export const LEARN_PATH = {
  landing: '/learn',
  course: '/learn/ai-training-foundations',
  module: (n: number) => `/learn/ai-training-foundations/module/${n}`,
  assessment: '/learn/ai-training-foundations/assessment',
  results: (id: string) => `/learn/ai-training-foundations/results/${id}`,
  certificate: (id: string) => `/certificate/${id}`,
} as const;
