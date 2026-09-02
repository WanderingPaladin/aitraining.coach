'use client';

import {
  ArrowUpDown,
  ChevronDown,
  GraduationCap,
  Laptop,
  Layers3,
  PhoneCall,
  Search,
  SlidersHorizontal,
  Tags,
  Target,
  UserPlus,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getAccountProfile,
  listOpportunities,
  type AccountProfile,
  type Opportunity,
  type ReadinessScore,
} from '../../lib/api';
import { useAuth } from './AuthProvider';
import OpportunityCard from './OpportunityCard';

type ExperienceFilter = '' | 'beginner' | 'experienced';

export default function OpportunitiesBoard() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState<ExperienceFilter>('');
  const [remote, setRemote] = useState(false);
  const [sort, setSort] = useState<'newest' | 'match'>(searchParams.get('sort') === 'match' ? 'match' : 'newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<Opportunity[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [matchAvailable, setMatchAvailable] = useState(false);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setReadiness(null);
      return;
    }
    let cancelled = false;
    void getAccountProfile()
      .then((result) => {
        if (cancelled) return;
        setProfile(result.profile);
        setReadiness(result.readiness);
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null);
          setReadiness(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listOpportunities({
      q: query,
      platform,
      category,
      beginnerFriendly: experience === 'beginner' ? true : experience === 'experienced' ? false : undefined,
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
      .catch(() => {
        if (!cancelled) setError("We couldn't load opportunities right now. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, platform, category, experience, remote, sort, user?.id, reloadKey]);

  const filterCount = useMemo(
    () => [platform, category, experience, remote].filter(Boolean).length,
    [platform, category, experience, remote],
  );

  function clearFilters() {
    setSearchInput('');
    setQuery('');
    setPlatform('');
    setCategory('');
    setExperience('');
    setRemote(false);
    setSort('newest');
  }

  const filterFields = (
    <>
      <label className="filter-field is-search">
        <span className="filter-label">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
          Search
        </span>
        <div className="filter-search">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by role, skill, or platform..."
          />
        </div>
      </label>
      <label className="filter-field">
        <span className="filter-label">
          <Layers3 size={16} strokeWidth={2} aria-hidden="true" />
          Platform
        </span>
        <span className="filter-select">
          <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
            <option value="">All platforms</option>
            {platforms.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </label>
      <label className="filter-field">
        <span className="filter-label">
          <Tags size={16} strokeWidth={2} aria-hidden="true" />
          Category
        </span>
        <span className="filter-select">
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </label>
      <label className="filter-field">
        <span className="filter-label">
          <GraduationCap size={16} strokeWidth={2} aria-hidden="true" />
          Experience
        </span>
        <span className="filter-select">
          <select
            value={experience}
            onChange={(event) => setExperience(event.target.value as ExperienceFilter)}
          >
            <option value="">All experience levels</option>
            <option value="beginner">Beginner-friendly</option>
            <option value="experienced">Experienced</option>
          </select>
          <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </label>
      <label className="filter-field">
        <span className="filter-label">
          <ArrowUpDown size={16} strokeWidth={2} aria-hidden="true" />
          Sort
        </span>
        <span className="filter-select">
          <select value={sort} onChange={(event) => setSort(event.target.value as 'newest' | 'match')}>
            <option value="newest">Newest</option>
            {user ? <option value="match">Best Match</option> : null}
          </select>
          <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </label>
      <label className="filter-remote">
        <Laptop size={16} strokeWidth={2} aria-hidden="true" />
        <input type="checkbox" checked={remote} onChange={(event) => setRemote(event.target.checked)} />
        Remote only
      </label>
    </>
  );

  const topCategories = [...new Set(items.map((item) => item.category))].slice(0, 2);

  return (
    <div className="opportunities-board">
      <div className="opportunity-board-head">
        <div>
          <h2>AI Training Opportunities</h2>
          <p>Explore current roles and open the original listing to apply.</p>
        </div>
        {!loading && !error ? <p className="opportunity-count">{items.length} opportunities</p> : null}
      </div>

      <form className="opportunity-filters" onSubmit={(event) => event.preventDefault()}>
        {filterFields}
        {filterCount ? (
          <button type="button" className="filter-clear" onClick={clearFilters}>
            <X size={16} strokeWidth={2} />
            Clear
          </button>
        ) : null}
      </form>

      <div className="opportunity-toolbar">
        <div className="filter-search">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by role, skill, or platform..."
          />
        </div>
        <button type="button" className="filter-toggle secondary-button on-light" onClick={() => setFiltersOpen(true)}>
          <SlidersHorizontal size={16} strokeWidth={2} />
          Filters{filterCount ? ` (${filterCount})` : ''}
        </button>
      </div>

      <div className="opportunities-layout">
        <div className="opportunity-results">
          {error ? (
            <p className="opportunity-error">
              {error}{' '}
              <button type="button" className="filter-clear" onClick={() => setReloadKey((value) => value + 1)}>
                Try again
              </button>
            </p>
          ) : null}
          {loading ? (
            <div className="opportunity-skeleton-list" aria-hidden="true">
              <div className="opportunity-card is-skeleton" />
              <div className="opportunity-card is-skeleton" />
              <div className="opportunity-card is-skeleton" />
            </div>
          ) : null}
          {!loading && !error && items.length === 0 ? (
            <div className="opportunity-empty">
              <img src="/illustrations/opportunities-empty-state.svg" alt="" />
              <h3>No opportunities match these filters.</h3>
              <p>Try removing a filter or searching for a broader skill.</p>
              <button type="button" className="primary-button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : null}
          {!loading && !error
            ? items.map((item) => (
                <OpportunityCard
                  key={item.id}
                  opportunity={item}
                  onSavedChange={(id, saved) => {
                    setItems((current) => current.map((row) => (row.id === id ? { ...row, saved } : row)));
                  }}
                />
              ))
            : null}
          <p className="opportunity-disclosure">
            AI Trainers curates external opportunities for discovery. Always verify requirements and availability on the original platform.
          </p>
        </div>

        <aside className="opportunity-rail">
          <section className="opportunity-rail-card">
            <h3>
              <Target size={16} strokeWidth={2} aria-hidden="true" />
              Find Your Best Fit
            </h3>
            {!user ? (
              <>
                <p>Create a profile to see how well each opportunity matches your background, experience, and preferences.</p>
                <a className="primary-button opportunity-view" href={`/login?returnTo=${encodeURIComponent('/opportunities')}`}>
                  <UserPlus size={16} strokeWidth={2} />
                  Create Your Profile
                </a>
              </>
            ) : !matchAvailable ? (
              <>
                <p>Complete your profile to unlock personalized opportunity matches.</p>
                <a className="primary-button opportunity-view" href="/profile/edit">
                  Complete Profile
                </a>
              </>
            ) : (
              <>
                <p>Your AI Training Fit</p>
                {readiness ? <p className="fit-score">{Math.min(100, readiness.score)}% profile readiness</p> : null}
                {topCategories.length ? (
                  <ul className="fit-categories">
                    {topCategories.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                ) : null}
                {profile ? (
                  <a className="secondary-button on-light opportunity-view" href="/profile">
                    View Profile
                  </a>
                ) : null}
              </>
            )}
          </section>
          <section className="opportunity-rail-card">
            <h3>Need guidance?</h3>
            <p>Not sure which opportunities fit you?</p>
            <p>Our coaching team can help you understand where your background fits and what to focus on next.</p>
            <a className="primary-button opportunity-view" href="/#apply">
              <PhoneCall size={16} strokeWidth={2} />
              Book a Free Intro Call
            </a>
          </section>
        </aside>
      </div>

      {filtersOpen ? (
        <div className="filter-drawer" role="dialog" aria-label="Filters">
          <button type="button" className="filter-drawer-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />
          <div className="filter-drawer-panel">
            <div className="filter-drawer-head">
              <h2>Filters</h2>
              <button type="button" className="filter-drawer-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                Done
              </button>
            </div>
            <form className="opportunity-filters is-drawer" onSubmit={(event) => event.preventDefault()}>
              {filterFields}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
