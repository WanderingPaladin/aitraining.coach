import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'app/globals.css'), 'utf8');
const storage = readFileSync(join(root, 'lib/learn/storage.ts'), 'utf8');

describe('learn progress math', () => {
  it('clamps completion to 0-100', () => {
    assert.match(storage, /Math\.min\(100, Math\.max\(0, raw\)\)/);
  });

  it('does not skip remaining modules after six completions', () => {
    assert.match(storage, /completedModules\.length >= MODULES\.length/);
    assert.doesNotMatch(storage, /completedModules\.length >= 6/);
  });
});

describe('practice labs sidebar CTA', () => {
  it('does not inherit the module-row 28px grid', () => {
    assert.match(css, /\.learn-sidenav ol a\s*\{[^}]*grid-template-columns:\s*28px/);
    assert.match(css, /\.learn-sidenav-cta[\s\S]{0,180}white-space:\s*nowrap/);
    assert.match(css, /\.learn-sidenav-cta[\s\S]{0,120}width:\s*100%/);
  });
});
