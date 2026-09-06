'use client';

import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { platformOptions } from '../../lib/opportunityDisplay';

export type OpportunityFilterState = {
  category: string;
  remote: '' | 'remote' | 'hybrid' | 'onsite';
  experience: '' | 'beginner' | 'entry' | 'mid' | 'senior' | 'lead';
  pay: '' | 'compensation' | 'hourly' | 'annual';
  platform: string;
  postedWithin: '' | '1' | '3' | '7' | '30';
};

const REMOTE_LABELS: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'Beginner / internship',
  entry: 'Entry level',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead / specialist',
};

const PAY_LABELS: Record<string, string> = {
  compensation: 'Has compensation',
  hourly: 'Hourly',
  annual: 'Annual',
};

const POSTED_LABELS: Record<string, string> = {
  '1': 'Past 24 hours',
  '3': 'Past 3 days',
  '7': 'Past 7 days',
  '30': 'Past 30 days',
};

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = useId();
  const selected = Boolean(value);
  return (
    <label className={`filter-field${selected ? ' is-active' : ''}`} htmlFor={id}>
      <span className="filter-label">{label}</span>
      <span className="filter-select">
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value || option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
      </span>
    </label>
  );
}

export function activeFilterChips(state: OpportunityFilterState) {
  const chips: Array<{ key: keyof OpportunityFilterState; label: string }> = [];
  if (state.category) chips.push({ key: 'category', label: state.category });
  if (state.remote) chips.push({ key: 'remote', label: REMOTE_LABELS[state.remote] ?? state.remote });
  if (state.experience) chips.push({ key: 'experience', label: EXPERIENCE_LABELS[state.experience] ?? state.experience });
  if (state.pay) chips.push({ key: 'pay', label: PAY_LABELS[state.pay] ?? state.pay });
  if (state.platform) chips.push({ key: 'platform', label: state.platform === 'other' ? 'Other platforms' : state.platform });
  if (state.postedWithin) chips.push({ key: 'postedWithin', label: POSTED_LABELS[state.postedWithin] ?? state.postedWithin });
  return chips;
}

export default function OpportunityFilters({
  state,
  categories,
  companies,
  onChange,
  onClear,
  open,
  onOpen,
  onClose,
  resultCount = 0,
  sortControl,
}: {
  state: OpportunityFilterState;
  categories: string[];
  companies: string[];
  onChange: (patch: Partial<OpportunityFilterState>) => void;
  onClear: () => void;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  resultCount?: number;
  sortControl?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const chips = activeFilterChips(state);
  const fields = (
    <>
      <Field
        label="Platform"
        value={state.platform}
        onChange={(value) => onChange({ platform: value })}
        options={platformOptions(companies)}
      />
      <Field
        label="Category"
        value={state.category}
        onChange={(value) => onChange({ category: value })}
        options={[{ value: '', label: 'All categories' }, ...categories.map((name) => ({ value: name, label: name }))]}
      />
      <Field
        label="Experience"
        value={state.experience}
        onChange={(value) => onChange({ experience: value as OpportunityFilterState['experience'] })}
        options={[
          { value: '', label: 'All experience levels' },
          { value: 'beginner', label: 'Beginner / internship' },
          { value: 'entry', label: 'Entry level' },
          { value: 'mid', label: 'Mid-level' },
          { value: 'senior', label: 'Senior' },
          { value: 'lead', label: 'Lead / specialist' },
        ]}
      />
      <Field
        label="Work type"
        value={state.remote}
        onChange={(value) => onChange({ remote: value as OpportunityFilterState['remote'] })}
        options={[
          { value: '', label: 'Any work type' },
          { value: 'remote', label: 'Remote' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'onsite', label: 'On-site' },
        ]}
      />
      <Field
        label="Pay"
        value={state.pay}
        onChange={(value) => onChange({ pay: value as OpportunityFilterState['pay'] })}
        options={[
          { value: '', label: 'Any pay' },
          { value: 'compensation', label: 'Has compensation' },
          { value: 'hourly', label: 'Hourly' },
          { value: 'annual', label: 'Annual' },
        ]}
      />
      <Field
        label="Date posted"
        value={state.postedWithin}
        onChange={(value) => onChange({ postedWithin: value as OpportunityFilterState['postedWithin'] })}
        options={[
          { value: '', label: 'Any time' },
          { value: '1', label: 'Past 24 hours' },
          { value: '3', label: 'Past 3 days' },
          { value: '7', label: 'Past 7 days' },
          { value: '30', label: 'Past 30 days' },
        ]}
      />
    </>
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    closeRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )].filter((node) => !node.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <div className="opportunity-filter-wrap">
      <form className="opportunity-filters" onSubmit={(event) => event.preventDefault()}>
        {fields}
      </form>
      <div className="opportunity-toolbar">
        <button type="button" className="filter-toggle secondary-button on-light" onClick={onOpen}>
          <SlidersHorizontal size={16} strokeWidth={2} />
          Filters{chips.length ? ` (${chips.length})` : ''}
        </button>
        {sortControl}
      </div>
      {chips.length ? (
        <div className="active-filter-row">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="active-filter-chip"
              onClick={() => onChange({ [chip.key]: '' })}
              aria-label={`Remove ${chip.label} filter`}
            >
              {chip.label}
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          ))}
          <button type="button" className="filter-clear" onClick={onClear}>
            Clear all
          </button>
        </div>
      ) : null}
      {open ? (
        <div className="filter-drawer is-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-drawer-title">
          <button type="button" className="filter-drawer-backdrop" onClick={onClose} aria-label="Close filters" />
          <div className="filter-drawer-panel" ref={panelRef}>
            <div className="filter-sheet-handle" aria-hidden="true" />
            <div className="filter-drawer-head">
              <h2 id="filter-drawer-title">Filters</h2>
              <button ref={closeRef} type="button" className="filter-drawer-close" onClick={onClose}>
                Done
              </button>
            </div>
            <form className="opportunity-filters is-drawer" onSubmit={(event) => event.preventDefault()}>
              {fields}
            </form>
            <div className="filter-drawer-actions">
              <button type="button" className="filter-clear" onClick={onClear} disabled={!chips.length}>
                <X size={16} strokeWidth={2} />
                Clear all
              </button>
              <button type="button" className="primary-button" onClick={onClose}>
                Show {resultCount} {resultCount === 1 ? 'opportunity' : 'opportunities'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
