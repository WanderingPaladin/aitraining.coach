export const FEEDBACK_CATEGORIES = [
  'confusing',
  'improvement',
  'problem',
  'general',
  'question',
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STEPS = [
  'closed',
  'welcome',
  'context',
  'topic',
  'details',
  'clarify',
  'blocker',
  'rating',
  'follow_up',
  'email',
  'submitting',
  'success',
  'error',
] as const;

export type FeedbackStep = (typeof FEEDBACK_STEPS)[number];

export type FeedbackChip = {
  id: string;
  label: string;
};

export type RouteContextPrompt = {
  key: string;
  question: string;
  options: FeedbackChip[];
  followUp?: Partial<Record<string, { question: string; options: FeedbackChip[] }>>;
};

export type FeedbackDraft = {
  step: Exclude<FeedbackStep, 'closed'>;
  history: Array<Exclude<FeedbackStep, 'closed'>>;
  category: FeedbackCategory | null;
  subcategory: string | null;
  contextAnswer: string | null;
  contextFollowUpId: string | null;
  message: string;
  clarify: string;
  blocker: boolean | null;
  rating: number | null;
  wantFollowUp: boolean | null;
  email: string;
  pagePath: string;
};

export type FeedbackPromptKind = 'application' | 'booking' | 'opportunities' | 'profile';

export const FEEDBACK_MAX_MESSAGE = 500;

export const emptyFeedbackDraft = (pagePath = '/'): FeedbackDraft => ({
  step: 'welcome',
  history: ['welcome'],
  category: null,
  subcategory: null,
  contextAnswer: null,
  contextFollowUpId: null,
  message: '',
  clarify: '',
  blocker: null,
  rating: null,
  wantFollowUp: null,
  email: '',
  pagePath,
});

export type CreateFeedbackPayload = {
  category: FeedbackCategory;
  subcategory?: string | null;
  message?: string;
  rating?: number | null;
  pagePath: string;
  pageUrl: string;
  email?: string | null;
  metadata: {
    browser?: string | null;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    screenWidth: number;
    screenHeight: number;
    referrer: string;
  };
};
