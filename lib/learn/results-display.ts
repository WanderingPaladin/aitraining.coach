export type ResultStep = {
  n: number;
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

type ResultLike = {
  level?: string;
  levelCopy?: { title: string; body: string };
  categories?: Array<{ key: string; label: string; score: number; band: string; insight?: string }>;
  strongest?: { label: string; score: number } | null;
  opportunity?: { label: string; score: number } | null;
  recommendations?: string[];
};

const CATEGORY_LAB: Record<string, string> = {
  instruction_following: 'Constraint Detective',
  response_evaluation: 'Response Ranking',
  factuality: 'Hallucination Spotter',
  written_reasoning: 'Justification Builder',
  attention_to_detail: 'Multi-constraint Challenge',
};

function labSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function practiceHrefForCategory(key?: string) {
  if (!key) return '/learn/ai-training-foundations/practice';
  const lab = CATEGORY_LAB[key];
  return lab ? `/learn/ai-training-foundations/practice/${labSlug(lab)}` : '/learn/ai-training-foundations/practice';
}

export function stageBody(result: Pick<ResultLike, 'level' | 'levelCopy'>) {
  if (result.level === 'foundation') {
    return "You're building the core evaluation habits covered in this course. Your results show some clear strengths and a few areas worth practicing before your next attempt.";
  }
  return result.levelCopy?.body ?? '';
}

export function skillHighlight(
  item: { label: string },
  strongest?: { label: string } | null,
  opportunity?: { label: string } | null,
): 'strongest' | 'focus' | null {
  if (strongest?.label && item.label === strongest.label) return 'strongest';
  if (opportunity?.label && item.label === opportunity.label && opportunity.label !== strongest?.label) {
    return 'focus';
  }
  return null;
}

export function skillStatusLabel(
  highlight: 'strongest' | 'focus' | null,
  band?: string,
) {
  if (highlight === 'strongest') return 'Your strongest area';
  if (highlight === 'focus') return 'Focus here';
  if (band === 'strong' || band === 'good') return band === 'strong' ? 'Strong' : 'Good';
  return null;
}

export function personalizedSteps(result: ResultLike): ResultStep[] {
  const recs = result.recommendations ?? [];
  const skillRec = recs.find((item) => !/does not predict|coach/i.test(item));
  const coachRec = recs.find((item) => /coach/i.test(item));
  const categories = [...(result.categories ?? [])].sort((a, b) => a.score - b.score);
  const weakest = result.opportunity;
  const second = categories.find((item) => item.label !== weakest?.label);
  const steps: ResultStep[] = [];
  if (weakest) {
    steps.push({
      n: steps.length + 1,
      title: `Strengthen ${weakest.label}`,
      body: skillRec || result.categories?.find((item) => item.label === weakest.label)?.insight || '',
      href: practiceHrefForCategory(result.categories?.find((item) => item.label === weakest.label)?.key),
      cta: 'Practice this skill',
    });
  }
  if (second?.insight) {
    steps.push({
      n: steps.length + 1,
      title: `Build ${second.label}`,
      body: second.insight,
    });
  }
  steps.push({
    n: steps.length + 1,
    title: 'Review your path with a coach',
    body: coachRec || 'Discuss your result, your background, and the areas worth prioritizing.',
    href: '/#apply',
    cta: 'Review my results',
  });
  return steps;
}
