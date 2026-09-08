import { ASSESSMENT_WEIGHTS, PASS_SCORE } from './course';
import bank from './data/assessment-key.json';
import type { AssessmentResult } from './api';

type ScoreCategory = (typeof ASSESSMENT_WEIGHTS)[number]['key'];

type BankItem = {
  id: string;
  category: ScoreCategory;
  type: string;
  correct?: string;
  keywords?: string[];
};

const QUESTIONS = bank as BankItem[];
const WEIGHTS = Object.fromEntries(ASSESSMENT_WEIGHTS.map((item) => [item.key, item.weight])) as Record<
  ScoreCategory,
  number
>;
const CATEGORY_LABEL: Record<ScoreCategory, string> = {
  instruction_following: 'Instruction Following',
  response_evaluation: 'Response Evaluation',
  factuality: 'Factuality & Research Judgment',
  written_reasoning: 'Written Reasoning',
  attention_to_detail: 'Attention to Detail',
};

const LEVEL_COPY = {
  excellent: {
    title: 'Excellent Foundation',
    body: 'You demonstrated strong foundational judgment across the core evaluation skills covered in this course.',
  },
  ready: {
    title: 'Ready to Start',
    body: 'You have a solid foundation for beginner AI-evaluation practice, with a few areas worth strengthening.',
  },
  developing: {
    title: 'Developing',
    body: 'You understand many of the core concepts, but additional practice should improve consistency.',
  },
  foundation: {
    title: 'Foundation Stage',
    body: 'You are still building the core evaluation habits covered in this course.',
  },
} as const;

const CATEGORY_COPY: Record<ScoreCategory, { strong: string; develop: string }> = {
  instruction_following: {
    strong: 'You reliably identify explicit constraints and notice when responses miss format, count, audience, or content requirements.',
    develop: 'Practice turning every complex prompt into a checklist before judging the answer.',
  },
  response_evaluation: {
    strong: 'You compare responses using relevance, clarity, completeness, and overall task fit rather than surface fluency alone.',
    develop: 'Practice evaluating each response independently before comparing them.',
  },
  factuality: {
    strong: 'You show good judgment around verifiable claims, source quality, uncertainty, and unsupported certainty.',
    develop: 'Practice identifying exact claims that need verification and choosing stronger sources.',
  },
  written_reasoning: {
    strong: 'Your explanations are specific, neutral, and tied to observable evidence.',
    develop: 'Use Decision → Evidence → Impact to make justifications less vague.',
  },
  attention_to_detail: {
    strong: 'You consistently catch subtle numeric, formatting, exclusion, and wording constraints.',
    develop: 'Slow down on multi-constraint tasks and use a final requirement checklist.',
  },
};

function sanitizeWritten(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\0/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600);
}

function scoreWritten(answer: string, keywords: string[]) {
  const text = sanitizeWritten(answer).toLowerCase();
  if (text.length < 12) return 0;
  const hits = keywords.filter((word) => text.includes(word.toLowerCase())).length;
  if (hits >= 2 && text.length >= 24) return 1;
  if (hits >= 1 && text.length >= 20) return 0.6;
  if (text.length >= 40) return 0.35;
  return 0;
}

function itemScore(question: BankItem, raw: unknown) {
  if (question.type === 'written') {
    return scoreWritten(typeof raw === 'string' ? raw : '', question.keywords ?? []);
  }
  const value = typeof raw === 'string' ? raw.trim() : '';
  return value && value === question.correct ? 1 : 0;
}

export function scoreLocalAttempt(
  answers: Record<string, string>,
  questionIds?: string[],
): AssessmentResult {
  const known = new Set(QUESTIONS.map((item) => item.id));
  const requested = (questionIds ?? []).filter((id) => known.has(id));
  const answered = Object.keys(answers).filter((id) => known.has(id));
  const selectedIds = requested.length ? requested : answered;
  const selected = QUESTIONS.filter((item) => selectedIds.includes(item.id));
  const grouped: Record<ScoreCategory, number[]> = {
    instruction_following: [],
    response_evaluation: [],
    factuality: [],
    written_reasoning: [],
    attention_to_detail: [],
  };
  for (const question of selected) {
    grouped[question.category].push(itemScore(question, answers[question.id]));
  }
  const categoryScores = Object.fromEntries(
    (Object.keys(WEIGHTS) as ScoreCategory[]).map((category) => {
      const values = grouped[category];
      const avg = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
      return [category, Math.round(avg * 100)];
    }),
  ) as Record<ScoreCategory, number>;
  const finalScore = Math.round(
    (Object.keys(WEIGHTS) as ScoreCategory[]).reduce((sum, category) => sum + categoryScores[category] * WEIGHTS[category], 0),
  );
  const categories = (Object.keys(WEIGHTS) as ScoreCategory[]).map((key) => {
    const score = categoryScores[key];
    const band = score >= 85 ? 'strong' : score >= 70 ? 'good' : 'developing';
    return {
      key,
      label: CATEGORY_LABEL[key],
      score,
      band,
      insight: score >= 85 ? CATEGORY_COPY[key].strong : CATEGORY_COPY[key].develop,
    };
  });
  const strongest = [...categories].sort((a, b) => b.score - a.score)[0];
  const weakest = [...categories].sort((a, b) => a.score - b.score)[0];
  const level = finalScore >= 90 ? 'excellent' : finalScore >= 75 ? 'ready' : finalScore >= 60 ? 'developing' : 'foundation';
  const ranked = (Object.keys(categoryScores) as ScoreCategory[]).sort((a, b) => categoryScores[a] - categoryScores[b]);
  const tips: Record<ScoreCategory, string> = {
    instruction_following: 'Practice turning prompts into checklists before you judge a response.',
    response_evaluation: 'Compare answers against each requested part of the prompt, not overall quality alone.',
    factuality: 'Flag specific dates, statistics, and study claims for verification when research is allowed.',
    written_reasoning: 'Use Decision → Evidence → Impact so your comments cite a concrete difference.',
    attention_to_detail: 'Re-read formatting, count, and ordering constraints before you submit a rating.',
  };
  return {
    attemptId: '',
    submitted: true,
    finalScore,
    passed: finalScore >= PASS_SCORE,
    passScore: PASS_SCORE,
    level,
    levelCopy: LEVEL_COPY[level],
    categories,
    strongest: strongest ? { label: strongest.label, score: strongest.score } : null,
    opportunity: weakest ? { label: weakest.label, score: weakest.score } : null,
    recommendations: [
      tips[ranked[0] ?? 'instruction_following'],
      'Explore opportunities that match your existing professional or academic skills. This assessment does not predict platform acceptance.',
      'Review your results with a coach if you want a practical next-step plan.',
    ],
  };
}

export function isEmptyScore(result: Pick<AssessmentResult, 'finalScore' | 'categories'> | null | undefined) {
  if (!result) return true;
  const total = result.finalScore ?? 0;
  const cats = result.categories ?? [];
  return total === 0 && (cats.length === 0 || cats.every((item) => (item.score ?? 0) === 0));
}
