'use client';

import { Filter, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { listOpportunities, type Opportunity } from '../../lib/api';
import { useAuth } from './AuthProvider';
import OpportunityCard from './OpportunityCard';

export default function OpportunitiesBoard() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [beginnerFriendly, setBeginnerFriendly] = useState(false);
  const [remote, setRemote] = useState(false);
  const [sort, setSort] = useState<'newest' | 'match'>(searchParams.get('sort') === 'match' ? 'match' : 'newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<Opportunity[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [matchAvailable, setMatchAvailable] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    void listOpportunities({
      q: query,
      platform,
      category,
      beginnerFriendly: beginnerFriendly || undefined,
      remote: remote || undefined,
      sort,
    })
      .then((result) => {
        if (cancelled) return;
        setItems(result.opportunities);
        setPlatforms(result.filters.platforms);
        setCategories(result.filters.categories);
        setMatchAvailable(result.matchAvailable);
        setError('');
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, platform, category, beginnerFriendly, remote, sort, user?.id]);

  const filterCount = useMemo(
    () => [platform, category, beginnerFriendly, remote].filter(Boolean).length,
    [platform, category, beginnerFriendly, remote],
  );

  const filterForm = (
    <form className="opportunity-filters apply-form" onSubmit={(event) => event.preventDefault()}>
      <label>
        Search
        <span>Title, skill, profession, or platform</span>
        <div className="filter-search">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search opportunities"
          />
        </div>
      </label>
      <label>
        Platform
        <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
          <option value="">All platforms</option>
          {platforms.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Professional category
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="apply-eligibility-label">
        <input
          type="checkbox"
          checked={beginnerFriendly}
          onChange={(event) => setBeginnerFriendly(event.target.checked)}
        />
        <span className="apply-eligibility-copy">Beginner-friendly</span>
      </label>
      <label className="apply-eligibility-label">
        <input type="checkbox" checked={remote} onChange={(event) => setRemote(event.target.checked)} />
        <span className="apply-eligibility-copy">Remote</span>
      </label>
      <label>
        Sort
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as 'newest' | 'match')}
        >
          <option value="newest">Newest</option>
          {user ? <option value="match">Best Match</option> : null}
        </select>
      </label>
      {sort === 'match' && user && !matchAvailable ? (
        <p className="filter-note">
          Add a profession or skills on your <a href="/profile/edit">profile</a> to sort by match.
        </p>
      ) : null}
    </form>
  );

  return (
    <div className="opportunities-board">
      <div className="opportunity-toolbar">
        <button type="button" className="filter-toggle secondary-button on-light" onClick={() => setFiltersOpen(true)}>
          <Filter size={16} strokeWidth={2} />
          Filters{filterCount ? ` (${filterCount})` : ''}
        </button>
      </div>

      <div className="opportunities-layout">
        <aside className="opportunity-sidebar">{filterForm}</aside>
        <div className="opportunity-results">
          {error ? <p className="apply-field-error">{error}</p> : null}
          {loading ? <p className="opportunity-empty">Loading opportunities…</p> : null}
          {!loading && items.length === 0 ? (
            <p className="opportunity-empty">No listings match those filters yet. Try clearing a filter or browse all platforms.</p>
          ) : null}
          {items.map((item) => (
            <OpportunityCard
              key={item.id}
              opportunity={item}
              onSavedChange={(id, saved) => {
                setItems((current) => current.map((row) => (row.id === id ? { ...row, saved } : row)));
              }}
            />
          ))}
          <p className="opportunity-disclosure">
            AI Trainers curates external opportunities for informational purposes. Unless explicitly stated, AI Trainers is not the employer and is not affiliated with the listed platforms. Always verify requirements and terms on the original listing.
          </p>
        </div>
      </div>

      {filtersOpen ? (
        <div className="filter-drawer" role="dialog" aria-label="Filters">
          <button type="button" className="filter-drawer-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />
          <div className="filter-drawer-panel">
            <div className="filter-drawer-head">
              <h2>Filters</h2>
              <button type="button" className="header-login" onClick={() => setFiltersOpen(false)}>
                Done
              </button>
            </div>
            {filterForm}
          </div>
        </div>
      ) : null}
    </div>
  );
}
