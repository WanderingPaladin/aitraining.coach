'use client';

import { ArrowUpDown, Target } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getAccountProfile,
  jobToOpportunity,
  listPublicJobs,
  type JobListFilters,
  type JobListResponse,
  type Opportunity,
  type ReadinessScore,
} from '../../lib/api';
import { useAuth } from './AuthProvider';
import CoachingCTA from './CoachingCTA';
import OpportunitiesHero, { PopularCategoryStrip } from './OpportunitiesHero';
import OpportunitiesPagination from './OpportunitiesPagination';
import OpportunityCard from './OpportunityCard';
import OpportunityFilters, {
  type OpportunityFilterState,
} from './OpportunityFilters';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import { requestFeedbackPrompt } from '../../lib/feedback-storage';

const PAGE_SIZE = 20;

type SortFilter = 'relevant' | 'newest' | 'salary' | 'match';

function parseRemote(value: string | null): OpportunityFilterState['remote'] {
  if (value === '1' || value === 'true' || value === 'remote') return 'remote';
  if (value === 'hybrid' || value === 'onsite') return value;
  return '';
}

function parseExperience(value: string | null): OpportunityFilterState['experience'] {
  if (value === 'beginner' || value === 'entry' || value === 'mid' || value === 'senior' || value === 'lead') {
    return value;
  }
  return '';
}

function parsePay(value: string | null): OpportunityFilterState['pay'] {
  if (value === 'compensation' || value === 'hourly' || value === 'annual') return value;
  return '';
}

function parsePosted(value: string | null): OpportunityFilterState['postedWithin'] {
  if (value === '1' || value === '3' || value === '7' || value === '30') return value;
  return '';
}

function parseSort(value: string | null): SortFilter {
  if (value === 'match' || value === 'salary' || value === 'relevant' || value === 'newest') return value;
  return 'newest';
}

export default function OpportunitiesBoard({
  initialJobs = null,
}: {
  initialJobs?: JobListResponse | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const seededItems = (initialJobs?.jobs ?? []).map(jobToOpportunity);
  const [query, setQuery] = useState(() => (searchParams.get('q') ?? '').trim());
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<OpportunityFilterState>(() => ({
    category: searchParams.get('category') ?? '',
    remote: parseRemote(searchParams.get('remote')),
    experience: parseExperience(searchParams.get('experience')),
    pay: parsePay(searchParams.get('pay')),
    platform: searchParams.get('platform') || searchParams.get('company') || '',
    postedWithin: parsePosted(searchParams.get('postedWithin')),
  }));
  const [sort, setSort] = useState<SortFilter>(() => parseSort(searchParams.get('sort')));
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(seededItems.length === 0);
  const [error, setError] = useState('');
  const [items, setItems] = useState<Opportunity[]>(seededItems);
  const [platforms, setPlatforms] = useState<string[]>(() =>
    [...new Set(initialJobs?.filters.companies ?? [])].sort((a, b) => a.localeCompare(b)),
  );
  const [categories, setCategories] = useState<string[]>(() =>
    [...new Set(initialJobs?.filters.categories ?? [])].sort((a, b) => a.localeCompare(b)),
  );
  const [total, setTotal] = useState(initialJobs?.total ?? 0);
  const [pageCount, setPageCount] = useState(Math.max(initialJobs?.pageCount ?? 1, 1));
  const [matchAvailable, setMatchAvailable] = useState(Boolean(initialJobs?.matchAvailable));
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [recommended, setRecommended] = useState<Opportunity[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const skipPageReset = useRef(true);
  const itemsRef = useRef(seededItems);
  itemsRef.current = items;

  useEffect(() => {
    if (items.length < 6) return;
    const timer = window.setTimeout(() => requestFeedbackPrompt('opportunities'), 8000);
    return () => window.clearTimeout(timer);
  }, [items.length]);

  const hasBrowseFilters = Boolean(
    query ||
      filters.category ||
      filters.remote ||
      filters.experience ||
      filters.pay ||
      filters.platform ||
      filters.postedWithin,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (skipPageReset.current) {
      skipPageReset.current = false;
      return;
    }
    setPage(1);
  }, [query, filters.category, filters.remote, filters.experience, filters.pay, filters.platform, filters.postedWithin, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.platform) params.set('platform', filters.platform);
    if (filters.category) params.set('category', filters.category);
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.pay) params.set('pay', filters.pay);
    if (filters.remote) params.set('remote', filters.remote === 'remote' ? '1' : filters.remote);
    if (filters.postedWithin) params.set('postedWithin', filters.postedWithin);
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/opportunities?${next}` : '/opportunities', { scroll: false });
    }
  }, [query, filters, sort, page, router, searchParams]);

  useEffect(() => {
    if (!user) {
      setReadiness(null);
      return;
    }
    let cancelled = false;
    void getAccountProfile()
      .then((result) => {
        if (cancelled) return;
        setReadiness(result.readiness);
      })
      .catch(() => {
        if (!cancelled) {
          setReadiness(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const listFilters = useMemo<JobListFilters>(
    () => ({
      q: query,
      remote: filters.remote || undefined,
      category: filters.category,
      platform: filters.platform || undefined,
      experience: filters.experience || undefined,
      pay: filters.pay || undefined,
      postedWithin: filters.postedWithin || undefined,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [query, filters, sort, page],
  );

  useEffect(() => {
    let cancelled = false;
    if (itemsRef.current.length === 0) {
      setLoading(true);
    }

    void listPublicJobs(listFilters)
      .then((result) => {
        if (cancelled) return;
        const jobItems = result.jobs.map(jobToOpportunity);
        setItems(jobItems);
        setPlatforms([...new Set(result.filters.companies)].sort((a, b) => a.localeCompare(b)));
        setCategories([...new Set(result.filters.categories)].sort((a, b) => a.localeCompare(b)));
        setMatchAvailable(Boolean(result.matchAvailable));
        setTotal(result.total);
        setPageCount(Math.max(result.pageCount, 1));
        setError('');
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        if (itemsRef.current.length === 0) {
          setError("We couldn't load opportunities right now. Please try again.");
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listFilters, reloadKey]);

  useEffect(() => {
    if (hasBrowseFilters || page > 1) {
      setRecommended([]);
      return;
    }
    let cancelled = false;
    const recommendedSort: JobListFilters['sort'] = user && (matchAvailable || readiness?.completeEnough) ? 'match' : 'relevant';
    void listPublicJobs({ sort: recommendedSort, page: 1, pageSize: 3 })
      .then((featured) => {
        if (cancelled) return;
        setRecommended((featured.jobs ?? []).map(jobToOpportunity));
      })
      .catch(() => {
        if (!cancelled) setRecommended([]);
      });
    return () => {
      cancelled = true;
    };
  }, [hasBrowseFilters, page, user, matchAvailable, readiness?.completeEnough]);

  function clearFilters() {
    setSearchInput('');
    setQuery('');
    setFilters({
      category: '',
      remote: '',
      experience: '',
      pay: '',
      platform: '',
      postedWithin: '',
    });
    setSort('newest');
    setPage(1);
  }

  function applyQuickFilter(id: string) {
    if (id === 'all') {
      setFilters((current) => ({ ...current, category: '', experience: '', remote: '' }));
      return;
    }
    if (id === 'beginner') {
      setFilters((current) => ({
        ...current,
        experience: current.experience === 'beginner' ? '' : 'beginner',
      }));
      return;
    }
    if (id === 'remote') {
      setFilters((current) => ({
        ...current,
        remote: current.remote === 'remote' ? '' : 'remote',
      }));
      return;
    }
    setFilters((current) => ({
      ...current,
      category: current.category === id ? '' : id,
    }));
  }

  const rangeFrom = total === 0 || items.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeTo = rangeFrom === 0 ? 0 : rangeFrom + items.length - 1;
  const showRecommended = !hasBrowseFilters && recommended.length >= 3;
  const recommendedPersonalized = Boolean(user && matchAvailable && recommended.some((item) => item.match && item.match.score > 0));
  const beforeCta = items.slice(0, 6);
  const afterCta = items.slice(6);

  return (
    <>
      <div className="journal-hero-wrap">
        <SiteHeader current="opportunities" />
        <OpportunitiesHero
          searchInput={searchInput}
          onSearch={setSearchInput}
          category={filters.category}
          experience={filters.experience}
          remote={filters.remote}
          onQuickFilter={applyQuickFilter}
        />
      </div>
      <div className="journal-light" id="listings">
        <div className="shell journal-main opportunities-page-main">
          <PopularCategoryStrip
            category={filters.category}
            onSelect={(value) => setFilters((current) => ({ ...current, category: value }))}
          />

          <div className="opportunity-board-head">
            <div>
              <h2>Browse opportunities</h2>
              <p className="opportunity-count">
                {loading && items.length === 0
                  ? 'Loading opportunities…'
                  : total === 0
                    ? 'No opportunities found'
                    : rangeFrom > 0 && total > items.length
                      ? `Showing ${rangeFrom}–${rangeTo} of ${total} opportunities`
                      : `${total} ${total === 1 ? 'opportunity' : 'opportunities'} found`}
              </p>
            </div>
            <label className="sort-field is-desktop">
              <span className="filter-label">
                <ArrowUpDown size={14} strokeWidth={2} aria-hidden="true" />
                Sort
              </span>
              <span className="filter-select">
                <select value={sort} onChange={(event) => setSort(event.target.value as SortFilter)}>
                  <option value="relevant">Recommended</option>
                  <option value="newest">Newest</option>
                  <option value="salary">Highest Pay</option>
                  {user ? <option value="match">Most Relevant</option> : null}
                </select>
                <ArrowUpDown size={14} strokeWidth={2} aria-hidden="true" />
              </span>
            </label>
          </div>

          <OpportunityFilters
            state={filters}
            categories={categories}
            companies={platforms}
            onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
            onClear={clearFilters}
            open={filtersOpen}
            onOpen={() => setFiltersOpen(true)}
            onClose={() => setFiltersOpen(false)}
            resultCount={total}
            sortControl={
              <label className="sort-field is-mobile">
                <span className="filter-label">
                  <ArrowUpDown size={14} strokeWidth={2} aria-hidden="true" />
                  Sort
                </span>
                <span className="filter-select">
                  <select value={sort} onChange={(event) => setSort(event.target.value as SortFilter)}>
                    <option value="relevant">Recommended</option>
                    <option value="newest">Newest</option>
                    <option value="salary">Highest Pay</option>
                    {user ? <option value="match">Most Relevant</option> : null}
                  </select>
                  <ArrowUpDown size={14} strokeWidth={2} aria-hidden="true" />
                </span>
              </label>
            }
          />

          {showRecommended ? (
            <section className="opportunity-section" aria-labelledby="recommended-heading">
              <div className="opportunity-section-head">
                <h3 id="recommended-heading">
                  {recommendedPersonalized ? 'Recommended for you' : 'Recommended opportunities'}
                </h3>
                <p>
                  {recommendedPersonalized
                    ? 'Opportunities aligned with your background and skills.'
                    : 'Featured roles from our current ranking of AI training work.'}
                </p>
              </div>
              <div className="opportunity-results is-featured">
                {recommended.slice(0, 3).map((item) => (
                  <OpportunityCard key={`rec-${item.id}`} opportunity={item} compact />
                ))}
              </div>
            </section>
          ) : null}

          <div className="opportunity-results">
            {error ? (
              <p className="opportunity-error">
                {error}{' '}
                <button type="button" className="filter-clear" onClick={() => setReloadKey((value) => value + 1)}>
                  Try again
                </button>
              </p>
            ) : null}
            {loading && items.length === 0 ? (
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
                <p>Try removing one or more filters.</p>
                <button type="button" className="primary-button" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : null}
            {items.length > 0 && sort === 'match' && matchAvailable ? (
              <>
                {items.filter((item) => item.match && item.match.score > 0).length ? (
                  <div className="match-group">
                    <h3 className="match-group-heading">
                      <Target size={18} strokeWidth={2} aria-hidden="true" />
                      Your Matches
                    </h3>
                    {items
                      .filter((item) => item.match && item.match.score > 0)
                      .map((item) => (
                        <OpportunityCard key={`job-${item.id}`} opportunity={item} />
                      ))}
                  </div>
                ) : (
                  <div className="opportunity-empty">
                    <h3>No matches for your profile yet.</h3>
                    <p>Complete your profile to unlock personalized matches, or browse all opportunities below.</p>
                  </div>
                )}
                {items.filter((item) => !item.match || item.match.score <= 0).length ? (
                  <div className="match-group">
                    <h3 className="match-group-heading is-secondary">Other Opportunities</h3>
                    {items
                      .filter((item) => !item.match || item.match.score <= 0)
                      .map((item) => (
                        <OpportunityCard key={`job-${item.id}`} opportunity={item} />
                      ))}
                  </div>
                ) : null}
              </>
            ) : items.length > 0 ? (
              <>
                {beforeCta.map((item) => (
                  <OpportunityCard key={`job-${item.id}`} opportunity={item} />
                ))}
                {items.length >= 6 ? <CoachingCTA /> : null}
                {afterCta.map((item) => (
                  <OpportunityCard key={`job-${item.id}`} opportunity={item} />
                ))}
                {items.length < 6 ? <CoachingCTA /> : null}
              </>
            ) : null}
            <OpportunitiesPagination
              page={page}
              pageCount={pageCount}
              rangeFrom={rangeFrom}
              rangeTo={rangeTo}
              total={total}
              onPage={setPage}
            />
            <p className="opportunity-disclosure">
              AI Trainers curates external opportunities for discovery and is not the employer. Employer listings are
              collected from public career pages. Always verify requirements and apply on the original platform.
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
