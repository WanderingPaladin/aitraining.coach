import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { displayOption, optionLayout } from '../lib/learn/assessment-options.ts';

describe('assessment option display', () => {
  it('shows Yes/No without the lowercase internal value', () => {
    assert.deepEqual(displayOption({ id: 'yes', label: 'Yes' }), {
      internalValue: 'yes',
      optionCode: null,
      displayText: 'Yes',
    });
    assert.deepEqual(displayOption({ id: 'no', label: 'No' }), {
      internalValue: 'no',
      optionCode: null,
      displayText: 'No',
    });
    assert.equal(optionLayout({ type: 'yesno' }, [
      displayOption({ id: 'yes', label: 'Yes' }),
      displayOption({ id: 'no', label: 'No' }),
    ]), 'binary');
  });

  it('keeps A/B/C/D as a badge and the label as the answer', () => {
    const option = displayOption({ id: 'B', label: 'Remain secondary' });
    assert.equal(option.internalValue, 'B');
    assert.equal(option.optionCode, 'B');
    assert.equal(option.displayText, 'Remain secondary');
    assert.equal(
      optionLayout({ type: 'mcq' }, [
        displayOption({ id: 'A', label: 'Override the rubric' }),
        displayOption({ id: 'B', label: 'Remain secondary' }),
        displayOption({ id: 'C', label: 'Automatically fail the answer' }),
        displayOption({ id: 'D', label: 'Determine the score' }),
      ]),
      'choice',
    );
  });

  it('does not invent a new submitted value for snake_case ids', () => {
    const option = displayOption({ id: 'remain_secondary', label: 'Remain secondary' });
    assert.equal(option.internalValue, 'remain_secondary');
    assert.equal(option.optionCode, null);
    assert.equal(option.displayText, 'Remain secondary');
  });

  it('uses a long card for compare and multiline responses', () => {
    const compare = [
      displayOption({ id: 'A', label: 'Gravity is the curvature of spacetime caused by mass-energy.' }),
      displayOption({ id: 'B', label: 'Gravity is the pull that makes things fall toward the ground.' }),
    ];
    assert.equal(optionLayout({ type: 'compare' }, compare), 'long');
    const multiline = [
      displayOption({ id: 'A', label: '- Walk the Lakefront Trail\n- Explore public street art' }),
      displayOption({ id: 'B', label: '- Visit Millennium Park for free' }),
    ];
    assert.equal(optionLayout({ type: 'mcq' }, multiline), 'long');
  });

  it('keeps two lettered short options as choice rows, not Yes/No tiles', () => {
    assert.equal(
      optionLayout({ type: 'mcq' }, [
        displayOption({ id: 'A', label: 'Flag for verification' }),
        displayOption({ id: 'B', label: 'Approve as written' }),
      ]),
      'choice',
    );
  });
});
