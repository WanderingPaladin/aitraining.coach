import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'app/globals.css'), 'utf8');
const storage = readFileSync(join(root, 'lib/learn/storage.ts'), 'utf8');
const sequence = readFileSync(join(root, 'lib/learn/sequence.ts'), 'utf8');
const practiceLab = readFileSync(join(root, 'app/components/learn/PracticeLab.tsx'), 'utf8');
const assessmentClient = readFileSync(join(root, 'app/components/learn/AssessmentClient.tsx'), 'utf8');
const api = readFileSync(join(root, 'lib/learn/api.ts'), 'utf8');
const scenarios = JSON.parse(
  readFileSync(join(root, 'lib/learn/data/practical-scenarios.json'), 'utf8'),
) as { scenarios: Array<{ lab: string }> };

function labSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function practiceLabs() {
  const labs: string[] = [];
  const seen = new Set<string>();
  for (const item of scenarios.scenarios) {
    const id = labSlug(item.lab);
    if (seen.has(id)) continue;
    seen.add(id);
    labs.push(id);
  }
  return labs;
}

function uniqueLabs(values: string[]) {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

describe('learn progress math', () => {
  it('clamps completion to 0-100', () => {
    assert.match(storage, /Math\.min\(100, Math\.max\(0, raw\)\)/);
  });

  it('does not skip remaining modules after six completions', () => {
    assert.match(storage, /completedModules\.length >= MODULES\.length/);
    assert.doesNotMatch(storage, /completedModules\.length >= 6/);
  });
});

describe('course overview card', () => {
  it('replaces the homepage marketing hero with a dashboard card', () => {
    const page = readFileSync(join(root, 'app/page.tsx'), 'utf8');
    const overview = readFileSync(join(root, 'lib/learn/overview.ts'), 'utf8');
    assert.doesNotMatch(page, /Could you evaluate AI responses professionally\?/);
    assert.match(page, /CourseOverviewCard/);
    assert.match(css, /\.learn-overview-card/);
    assert.doesNotMatch(css, /\.learn-home-benefits/);
    assert.doesNotMatch(css, /\.learn-score-ring/);
    assert.match(overview, /not_started/);
    assert.match(overview, /assessment_ready/);
    assert.match(overview, /Take final assessment/);
    assert.match(overview, /View certificate/);
  });
});

describe('practice labs sidebar CTA', () => {
  it('does not inherit the module-row 28px grid', () => {
    assert.match(css, /\.learn-sidenav ol a\s*\{[^}]*grid-template-columns:\s*28px/);
    assert.match(css, /\.learn-sidenav-cta[\s\S]{0,180}white-space:\s*nowrap/);
    assert.match(css, /\.learn-sidenav-cta[\s\S]{0,120}width:\s*100%/);
  });
});

describe('practice lab completion and next step', () => {
  it('derives lab order from practical-scenarios.json', () => {
    const labs = practiceLabs();
    assert.equal(labs[0], 'constraint-detective');
    assert.ok(labs.includes('final-mixed-practice'));
    assert.match(sequence, /practiceLabs\(\)/);
    assert.match(sequence, /LEARN_PATH\.lab\(nextLab\.id\)/);
    assert.doesNotMatch(sequence, /constraint-detective →/);
  });

  it('keeps lab completion idempotent and encoded in existing progress JSON', () => {
    const first = uniqueLabs(['constraint-detective']);
    const again = uniqueLabs([...first, 'constraint-detective']);
    assert.deepEqual(again, ['constraint-detective']);
    assert.match(storage, /LAB_PROGRESS_PREFIX/);
    assert.match(storage, /completedLabs/);
    assert.match(storage, /quizResultsWithLabs/);
  });

  it('points a completed lab to the next lab in the data source', () => {
    const labs = practiceLabs();
    const expectedNext = `/learn/ai-training-foundations/practice/${labs[1]}`;
    assert.match(sequence, /Continue to next lab/);
    assert.match(sequence, /getNextLearningStep/);
    assert.equal(expectedNext, `/learn/ai-training-foundations/practice/${labSlug(scenarios.scenarios[1].lab)}`);
  });

  it('points the final required path to the assessment', () => {
    assert.match(sequence, /Take final assessment/);
    assert.match(sequence, /Continue assessment/);
    assert.match(sequence, /View results/);
    assert.match(sequence, /Back to course overview/);
    assert.equal(practiceLabs().at(-1), 'final-mixed-practice');
  });

  it('persists lab completion and shows a next action after success', () => {
    assert.match(practiceLab, /isLabComplete/);
    assert.match(practiceLab, /updateAndPersist/);
    assert.match(practiceLab, /Lab complete/);
    assert.match(practiceLab, /getNextLearningStep/);
    assert.match(practiceLab, /We couldn't save your completion/);
    assert.doesNotMatch(practiceLab, /setDone\(true\)/);
  });
});

describe('assessment persistence UX', () => {
  it('saves answers with current question index and exposes retry state', () => {
    assert.match(assessmentClient, /currentIndex/);
    assert.match(assessmentClient, /Not saved/);
    assert.match(assessmentClient, /Saving…/);
    assert.match(assessmentClient, /Saved ✓/);
    assert.match(assessmentClient, /submitLock/);
    assert.match(assessmentClient, /Continue assessment|attemptId/);
    assert.match(api, /currentIndex/);
    assert.match(api, /headers\.delete\('content-type'\)/);
  });

  it('does not start a new attempt when one is already in progress', () => {
    assert.match(assessmentClient, /startAssessment\(existing, retake\)/);
    assert.match(assessmentClient, /local\.attemptId !== result\.attempt\.id/);
  });
});
