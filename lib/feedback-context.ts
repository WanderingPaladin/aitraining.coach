import type { FeedbackCategory, FeedbackChip, RouteContextPrompt } from './feedback-types';

export const CATEGORY_OPTIONS: Array<{ id: FeedbackCategory; label: string }> = [
  { id: 'confusing', label: 'Something was confusing' },
  { id: 'improvement', label: 'Suggest an improvement' },
  { id: 'problem', label: 'Report a problem' },
  { id: 'general', label: 'Share general feedback' },
  { id: 'question', label: 'Ask a quick question' },
];

export const CONFUSING_TOPICS: FeedbackChip[] = [
  { id: 'how_it_works', label: 'Understand how AI Trainers works' },
  { id: 'apply', label: 'Apply' },
  { id: 'book_call', label: 'Book a call' },
  { id: 'opportunities', label: 'Find opportunities' },
  { id: 'profile', label: 'Understand my profile' },
  { id: 'profile_match', label: 'Understand Profile Match' },
  { id: 'other', label: 'Something else' },
];

export const IMPROVEMENT_TOPICS: FeedbackChip[] = [
  { id: 'navigation', label: 'Website navigation' },
  { id: 'application', label: 'Application process' },
  { id: 'booking', label: 'Booking' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'profile', label: 'Profile' },
  { id: 'profile_match', label: 'Profile Match' },
  { id: 'coaching', label: 'Coaching information' },
  { id: 'other', label: 'Something else' },
];

export const PROBLEM_TOPICS: FeedbackChip[] = [
  { id: 'page_not_loading', label: 'Page not loading' },
  { id: 'button_not_working', label: 'Button not working' },
  { id: 'form_issue', label: 'Form issue' },
  { id: 'booking_issue', label: 'Booking issue' },
  { id: 'login_account', label: 'Login/account issue' },
  { id: 'opportunity_issue', label: 'Opportunity issue' },
  { id: 'visual_layout', label: 'Visual/layout issue' },
  { id: 'other', label: 'Other' },
];

export const TOPIC_OPTIONS: Partial<Record<FeedbackCategory, FeedbackChip[]>> = {
  confusing: CONFUSING_TOPICS,
  improvement: IMPROVEMENT_TOPICS,
  problem: PROBLEM_TOPICS,
};

export const TOPIC_QUESTIONS: Partial<Record<FeedbackCategory, string>> = {
  confusing: 'What were you trying to do?',
  improvement: 'What would you like us to improve?',
  problem: 'What kind of problem did you run into?',
};

export const DETAIL_COPY: Record<FeedbackCategory, { question: string; placeholder: string }> = {
  confusing: {
    question: 'What felt unclear or difficult?',
    placeholder: 'Tell us what was confusing...',
  },
  improvement: {
    question: 'What would make this better?',
    placeholder: 'Share your idea...',
  },
  problem: {
    question: 'What happened?',
    placeholder: 'Describe what happened and what you expected...',
  },
  general: {
    question: 'What would you like us to know?',
    placeholder: 'Type your feedback here...',
  },
  question: {
    question: 'What would you like to know?',
    placeholder: 'Type your question here...',
  },
};

const HOMEPAGE_CONTEXT: RouteContextPrompt = {
  key: 'home',
  question: 'Was it clear what AI Trainers can help you with?',
  options: [
    { id: 'very_clear', label: 'Very clear' },
    { id: 'mostly_clear', label: 'Mostly clear' },
    { id: 'not_really', label: 'Not really' },
  ],
};

const OPPORTUNITIES_CONTEXT: RouteContextPrompt = {
  key: 'opportunities',
  question: 'How easy is it to find relevant opportunities?',
  options: [
    { id: 'easy', label: 'Easy' },
    { id: 'somewhat_difficult', label: 'Somewhat difficult' },
    { id: 'difficult', label: 'Difficult' },
  ],
  followUp: {
    somewhat_difficult: {
      question: 'What is making it harder?',
      options: [
        { id: 'filters', label: 'Filters are unclear' },
        { id: 'irrelevant', label: 'Too many irrelevant roles' },
        { id: 'search', label: 'Search results' },
        { id: 'details', label: 'Opportunity details' },
        { id: 'other', label: 'Something else' },
      ],
    },
    difficult: {
      question: 'What is making it harder?',
      options: [
        { id: 'filters', label: 'Filters are unclear' },
        { id: 'irrelevant', label: 'Too many irrelevant roles' },
        { id: 'search', label: 'Search results' },
        { id: 'details', label: 'Opportunity details' },
        { id: 'other', label: 'Something else' },
      ],
    },
  },
};

const PROFILE_CONTEXT: RouteContextPrompt = {
  key: 'profile',
  question: 'Is your Profile Match easy to understand?',
  options: [
    { id: 'yes', label: 'Yes' },
    { id: 'somewhat', label: 'Somewhat' },
    { id: 'no', label: 'No' },
  ],
  followUp: {
    no: {
      question: 'What feels unclear?',
      options: [
        { id: 'why_number', label: 'Why the score is this number' },
        { id: 'what_affects', label: 'What affects the score' },
        { id: 'how_improve', label: 'How to improve it' },
        { id: 'other', label: 'Something else' },
      ],
    },
  },
};

const MATCH_CONTEXT: RouteContextPrompt = {
  key: 'match',
  question: 'Was your Profile Match easy to understand?',
  options: [
    { id: 'yes', label: 'Yes' },
    { id: 'somewhat', label: 'Somewhat' },
    { id: 'no', label: 'No' },
  ],
};

const BOOKING_CONTEXT: RouteContextPrompt = {
  key: 'booking',
  question: 'How easy was it to complete this step?',
  options: [
    { id: 'easy', label: 'Easy' },
    { id: 'okay', label: 'Okay' },
    { id: 'difficult', label: 'Difficult' },
  ],
};

export function getRouteContext(pathname: string, hash = ''): RouteContextPrompt | null {
  const path = pathname.replace(/\/$/, '') || '/';
  if (hash === '#apply' || hash.startsWith('#apply')) return BOOKING_CONTEXT;
  if (path === '/') return HOMEPAGE_CONTEXT;
  if (/^\/opportunities\/[^/]+/.test(path)) return MATCH_CONTEXT;
  if (path.startsWith('/opportunities')) return OPPORTUNITIES_CONTEXT;
  if (path.startsWith('/profile')) return PROFILE_CONTEXT;
  return null;
}

export function deviceTypeFromWidth(width: number): 'desktop' | 'tablet' | 'mobile' {
  if (width < 768) return 'mobile';
  if (width < 1100) return 'tablet';
  return 'desktop';
}
