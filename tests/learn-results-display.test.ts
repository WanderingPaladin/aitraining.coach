import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  personalizedSteps,
  practiceHrefForCategory,
  skillHighlight,
  skillStatusLabel,
  stageBody,
} from '../lib/learn/results-display.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('results presentation helpers', () => {
  it('maps weakest categories to existing practice labs without changing scores', () => {
    assert.equal(practiceHrefForCategory('response_evaluation'), '/learn/ai-training-foundations/practice/response-ranking');
    assert.equal(practiceHrefForCategory('factuality'), '/learn/ai-training-foundations/practice/hallucination-spotter');
    assert.equal(practiceHrefForCategory('unknown'), '/learn/ai-training-foundations/practice');
  });

  it('does not repeat Developing as a skill status', () => {
    assert.equal(skillStatusLabel(null, 'developing'), null);
    assert.equal(skillStatusLabel('focus', 'developing'), 'Focus here');
    assert.equal(skillStatusLabel('strongest', 'good'), 'Your strongest area');
    assert.equal(skillHighlight({ label: 'Written Reasoning' }, { label: 'Written Reasoning' }, { label: 'Response Evaluation' }), 'strongest');
    assert.equal(skillHighlight({ label: 'Response Evaluation' }, { label: 'Written Reasoning' }, { label: 'Response Evaluation' }), 'focus');
  });

  it('builds next steps from result data instead of screenshot scores', () => {
    const steps = personalizedSteps({
      attemptId: 'x',
      submitted: true,
      opportunity: { label: 'Response Evaluation', score: 14 },
      strongest: { label: 'Written Reasoning', score: 60 },
      categories: [
        { key: 'response_evaluation', label: 'Response Evaluation', score: 14, band: 'developing', insight: 'Practice independently.' },
        { key: 'written_reasoning', label: 'Written Reasoning', score: 60, band: 'developing', insight: 'Use Decision → Evidence → Impact.' },
      ],
      recommendations: [
        'Practice evaluating each response independently before comparing them.',
        'Explore opportunities that match your existing professional or academic skills. This assessment does not predict platform acceptance.',
        'Review your results with a coach if you want a practical next-step plan.',
      ],
    });
    assert.equal(steps[0]?.title, 'Strengthen Response Evaluation');
    assert.match(steps[0]?.body ?? '', /independently/);
    assert.equal(steps[0]?.href, '/learn/ai-training-foundations/practice/response-ranking');
    assert.equal(steps.at(-1)?.href, '/#apply');
    assert.equal(stageBody({ level: 'foundation', levelCopy: { title: 'Foundation Stage', body: 'You are still building the core evaluation habits covered in this course.' } }).includes('clear strengths'), true);
    assert.equal(stageBody({ level: 'ready', levelCopy: { title: 'Ready to Start', body: 'Keep the API body.' } }), 'Keep the API body.');
  });
});

describe('results page presentation', () => {
  it('keeps scoring recovery and makes coaching the primary CTA', () => {
    const view = readFileSync(join(root, 'app/components/learn/ResultsView.tsx'), 'utf8');
    const css = readFileSync(join(root, 'app/globals.css'), 'utf8');
    const skeleton = readFileSync(join(root, 'app/components/learn/ResultsSkeleton.tsx'), 'utf8');
    assert.match(view, /scoreLocalAttempt/);
    assert.match(view, /We couldn&apos;t calculate your score/);
    assert.match(view, /Review my results with a coach/);
    assert.match(view, /className="primary-button"[\s\S]*\/#apply/);
    assert.doesNotMatch(view, /View recommended opportunities/);
    assert.match(view, /Explore recommended opportunities/);
    assert.match(skeleton, /Loading your results…/);
    assert.match(css, /\.learn-results-page/);
    assert.match(css, /\.learn-score-ring/);
    assert.match(view, /Your Assessment Results/);
    assert.match(view, /Other actions/);
    assert.doesNotMatch(view, /finalScore = 39/);
  });
});
