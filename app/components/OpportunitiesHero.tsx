'use client';

import {
  Code2,
  FlaskConical,
  GraduationCap,
  Landmark,
  PenLine,
  Scale,
  Search,
  Sparkles,
  Tags,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { POPULAR_CATEGORIES, QUICK_FILTERS } from '../../lib/opportunityDisplay';

const CATEGORY_ICONS = {
  Coding: Code2,
  Writing: PenLine,
  Science: FlaskConical,
  Finance: Landmark,
  Legal: Scale,
  'AI Evaluation': Sparkles,
  'Data Annotation': Tags,
} as const;

export default function OpportunitiesHero({
  searchInput,
  onSearch,
  category,
  experience,
  remote,
  onQuickFilter,
}: {
  searchInput: string;
  onSearch: (value: string) => void;
  category: string;
  experience: string;
  remote: string;
  onQuickFilter: (id: string) => void;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <section className="journal-hero opportunities-hero">
      <div className="hero-glow" />
      <div className="shell opportunities-hero-inner">
        <p className="journal-eyebrow">AI Training Opportunities</p>
        <h1>
          Find work that <span className="hero-hl">fits your expertise.</span>
        </h1>
        <p className="journal-lead">
          Explore curated AI training, evaluation, coding, writing, and domain-expert opportunities.
        </p>
        <form className="opportunity-hero-search" onSubmit={submit} role="search">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <label className="sr-only" htmlFor="opportunity-search">
            Search roles, skills, or companies
          </label>
          <input
            id="opportunity-search"
            value={searchInput}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search roles, skills, or companies..."
            autoComplete="off"
          />
        </form>
        <div className="quick-filter-row" role="group" aria-label="Quick filters">
          {QUICK_FILTERS.map((chip) => {
            const selected =
              chip.id === 'all'
                ? !category && !experience && remote !== 'remote'
                : chip.id === 'beginner'
                  ? experience === 'beginner'
                  : chip.id === 'remote'
                    ? remote === 'remote'
                    : category === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                className={`quick-chip${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => onQuickFilter(chip.id)}
              >
                {chip.id === 'beginner' ? <GraduationCap size={14} strokeWidth={2} aria-hidden="true" /> : null}
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PopularCategoryStrip({
  category,
  onSelect,
}: {
  category: string;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="popular-category-strip" aria-labelledby="popular-now-heading">
      <div className="popular-category-head">
        <h2 id="popular-now-heading">Popular right now</h2>
      </div>
      <div className="popular-category-row">
        {POPULAR_CATEGORIES.map((item) => {
          const Icon = CATEGORY_ICONS[item.value];
          const selected = category === item.value;
          return (
            <button
              key={item.value}
              type="button"
              className={`popular-category-card${selected ? ' is-selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onSelect(selected ? '' : item.value)}
            >
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
