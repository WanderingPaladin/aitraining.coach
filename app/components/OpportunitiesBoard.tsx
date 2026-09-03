'use client';

import {
  ArrowUpDown,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  getAccountProfile,
  jobToOpportunity,
  listOpportunities,
  listPublicJobs,
  type AccountProfile,
  type JobListResponse,
  type Opportunity,
  type OpportunityListResponse,
  type ReadinessScore,
} from '../../lib/api';
import { useAuth } from './AuthProvider';
import OpportunityCard from './OpportunityCard';

type ExperienceFilter = '' | 'beginner' | 'experienced';
type SortFilter = 'newest' | 'match';

const PAGE_SIZE = 20;

function emptyJobs(): JobListResponse {
  return {
    jobs: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    pageCount: 1,
    filters: { categories: [], companies: [], employmentTypes: [] },
  };
}

function tagCurated(items: Opportunity[]): Opportunity[] {
  return items.map((item) => ({ ...item, listingKind: item.listingKind ?? 'curated' }));
}

function listingTime(item: Opportunity) {
  return Date.parse(item.postedAt || item.firstSeenAt) || 0;
}

function listingScore(item: Opportunity) {
  if (item.listingKind === 'job') {
    return item.relevanceScore ?? 0;
  }
  return item.match?.score ?? 0;
}

function mergeListings(curated: Opportunity[], jobs: Opportunity[], sort: SortFilter) {
  return [...curated, ...jobs].sort((left, right) => {
    if (sort === 'match') {
      return listingScore(right) - listingScore(left) || listingTime(right) - listingTime(left);
    }
    return listingTime(right) - listingTime(left);
  });
}

function emptyCurated(): OpportunityListResponse {
  return { opportunities: [], filters: { platforms: [], categories: [] }, matchAvailable: false };
}

function paginationItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages = new Set([1, total, current]);
  if (current > 2) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 3);
    pages.add(total - 2);
    pages.add(total - 1);
  }
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];
  for (let index = 0; index < sorted.length; index += 1) {
    if (index > 0 && sorted[index] - sorted[index - 1] > 1) {
      items.push('ellipsis');
    }
    items.push(sorted[index]);
  }
  return items;
}

export default function OpportunitiesBoard({
  initialCurated = null,
  initialJobs = null,
}: {
  initialCurated?: OpportunityListResponse | null;
  initialJobs?: JobListResponse | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const seededCurated = initialPage === 1 ? tagCurated(initialCurated?.opportunities ?? []) : [];
  const seededJobs = (initialJobs?.jobs ?? []).map(jobToOpportunity);
  const seededItems = mergeListings(seededCurated, seededJobs, 'newest');
  const [query, setQuery] = useState(() => (searchParams.get('q') ?? '').trim());
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') ?? '');
  const [platform, setPlatform] = useState(() => searchParams.get('platform') ?? '');
  const [category, setCategory] = useState(() => searchParams.get('category') ?? '');
  const [experience, setExperience] = useState<ExperienceFilter>(
    () => (searchParams.get('experience') as ExperienceFilter) || '',
  );
  const [employmentType, setEmploymentType] = useState(() => searchParams.get('employmentType') ?? '');
  const [remote, setRemote] = useState(() => searchParams.get('remote') === '1' || searchParams.get('remote') === 'true');
  const [sort, setSort] = useState<SortFilter>(searchParams.get('sort') === 'match' ? 'match' : 'newest');
  const [page, setPage] = useState(initialPage);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(seededItems.length === 0);
  const [error, setError] = useState('');
  const [items, setItems] = useState<Opportunity[]>(seededItems);
  const [platforms, setPlatforms] = useState<string[]>(() =>
    [...new Set([...(initialCurated?.filters.platforms ?? []), ...(initialJobs?.filters.companies ?? [])])].sort((a, b) =>
      a.localeCompare(b),
    ),
  );
  const [categories, setCategories] = useState<string[]>(() =>
    [...new Set([...(initialCurated?.filters.categories ?? []), ...(initialJobs?.filters.categories ?? [])])].sort((a, b) =>
      a.localeCompare(b),
    ),
  );
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(initialJobs?.filters.employmentTypes ?? []);
  const [total, setTotal] = useState(seededCurated.length + (initialJobs?.total ?? 0));
  const [pageCount, setPageCount] = useState(Math.max(initialJobs?.pageCount ?? 1, 1));
  const [matchAvailable, setMatchAvailable] = useState(Boolean(initialCurated?.matchAvailable));
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const skipPageReset = useRef(true);
  const itemsRef = useRef(seededItems);
  itemsRef.current = items;

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
  }, [query, platform, category, experience, employmentType, remote, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (platform) params.set('platform', platform);
    if (category) params.set('category', category);
    if (experience) params.set('experience', experience);
    if (employmentType) params.set('employmentType', employmentType);
    if (remote) params.set('remote', '1');
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/opportunities?${next}` : '/opportunities', { scroll: false });
    }
  }, [query, platform, category, experience, employmentType, remote, sort, page, router, searchParams]);

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
    const includeCuratedItems = !employmentType && page === 1;
    const includeJobItems = experience === '';
    if (itemsRef.current.length === 0) {
      setLoading(true);
    }

    let curatedResult = emptyCurated();
    let jobsResult = emptyJobs();
    let curatedDone = false;
    let jobsDone = false;
    let curatedFailed = false;
    let jobsFailed = false;

    const publish = () => {
      if (cancelled) return;
      if (curatedFailed && jobsFailed) {
        if (itemsRef.current.length === 0) {
          setError("We couldn't load opportunities right now. Please try again.");
        }
        setLoading(false);
        return;
      }
      if (!curatedDone && jobsDone && jobsResult.jobs.length === 0) {
        return;
      }
      const curatedItems = includeCuratedItems ? tagCurated(curatedResult.opportunities) : [];
      const jobItems = includeJobItems ? jobsResult.jobs.map(jobToOpportunity) : [];
      setItems(mergeListings(curatedItems, jobItems, sort));
      setPlatforms(
        [...new Set([...curatedResult.filters.platforms, ...jobsResult.filters.companies])].sort((a, b) =>
          a.localeCompare(b),
        ),
      );
      setCategories(
        [...new Set([...curatedResult.filters.categories, ...jobsResult.filters.categories])].sort((a, b) =>
          a.localeCompare(b),
        ),
      );
      if (jobsDone) {
        setEmploymentTypes(jobsResult.filters.employmentTypes);
      }
      setMatchAvailable(Boolean(curatedResult.matchAvailable));
      setTotal((employmentType ? 0 : curatedResult.opportunities.length) + (includeJobItems ? jobsResult.total : 0));
      setPageCount(includeJobItems ? Math.max(jobsResult.pageCount, 1) : 1);
      setError('');
      if (curatedDone || jobItems.length > 0) {
        setLoading(false);
      }
    };

    void listOpportunities({
      q: query,
      platform,
      category,
      beginnerFriendly: experience === 'beginner' ? true : experience === 'experienced' ? false : undefined,
      remote: remote || undefined,
      sort,
    })
      .then((result) => {
        curatedResult = result;
      })
      .catch(() => {
        curatedFailed = true;
        curatedResult = emptyCurated();
      })
      .finally(() => {
        curatedDone = true;
        publish();
      });

    void listPublicJobs({
      q: query,
      remote: remote || undefined,
      category,
      employmentType: employmentType || undefined,
      company: platform || undefined,
      sort: sort === 'match' ? 'relevant' : 'newest',
      page,
      pageSize: PAGE_SIZE,
    })
      .then((result) => {
        jobsResult = result;
      })
      .catch(() => {
        jobsFailed = true;
        jobsResult = emptyJobs();
      })
      .finally(() => {
        jobsDone = true;
        publish();
      });

    return () => {
      cancelled = true;
    };
  }, [query, platform, category, experience, employmentType, remote, sort, page, reloadKey]);

  const filterCount = useMemo(
    () => [platform, category, experience, employmentType, remote].filter(Boolean).length,
    [platform, category, experience, employmentType, remote],
  );

  function clearFilters() {
    setSearchInput('');
    setQuery('');
    setPlatform('');
    setCategory('');
    setExperience('');
    setEmploymentType('');
    setRemote(false);
    setSort('newest');
    setPage(1);
  }

  function selectField(
    label: string,
    icon: ReactNode,
    value: string,
    onChange: (value: string) => void,
    options: Array<{ value: string; label: string }>,
  ) {
    return (
      <label className="filter-field">
        <span className="filter-label">
          {icon}
          {label}
        </span>
        <span className="filter-select">
          <select value={value} onChange={(event) => onChange(event.target.value)}>
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

  const searchField = (
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
          placeholder="Search roles, skills, or platforms..."
          aria-label="Search roles, skills, or platforms"
        />
      </div>
    </label>
  );

  const coreFilters = (
    <>
      {selectField(
        'Platform',
        <Layers3 size={16} strokeWidth={2} aria-hidden="true" />,
        platform,
        setPlatform,
        [{ value: '', label: 'All platforms' }, ...platforms.map((name) => ({ value: name, label: name }))],
      )}
      {selectField(
        'Category',
        <Tags size={16} strokeWidth={2} aria-hidden="true" />,
        category,
        setCategory,
        [{ value: '', label: 'All categories' }, ...categories.map((name) => ({ value: name, label: name }))],
      )}
      {selectField(
        'Experience',
        <GraduationCap size={16} strokeWidth={2} aria-hidden="true" />,
        experience,
        (value) => setExperience(value as ExperienceFilter),
        [
          { value: '', label: 'All experience levels' },
          { value: 'beginner', label: 'Beginner-friendly' },
          { value: 'experienced', label: 'Experienced' },
        ],
      )}
      {selectField(
        'Remote',
        <Laptop size={16} strokeWidth={2} aria-hidden="true" />,
        remote ? '1' : '',
        (value) => setRemote(value === '1'),
        [
          { value: '', label: 'Any location' },
          { value: '1', label: 'Remote only' },
        ],
      )}
      {selectField(
        'Sort',
        <ArrowUpDown size={16} strokeWidth={2} aria-hidden="true" />,
        sort,
        (value) => setSort(value as SortFilter),
        [
          { value: 'newest', label: 'Newest' },
          ...(user ? [{ value: 'match', label: 'Best Match' }] : []),
        ],
      )}
    </>
  );

  const typeFilter =
    employmentTypes.length > 0
      ? selectField(
          'Type',
          <BriefcaseBusiness size={16} strokeWidth={2} aria-hidden="true" />,
          employmentType,
          setEmploymentType,
          [
            { value: '', label: 'All types' },
            ...employmentTypes.map((name) => ({ value: name, label: name.replace(/-/g, ' ') })),
          ],
        )
      : null;

  const rangeFrom = total === 0 || items.length === 0 ? 0 : page === 1 ? 1 : (page - 1) * PAGE_SIZE + 1;
  const rangeTo = rangeFrom === 0 ? 0 : rangeFrom + items.length - 1;
  const topCategories = [...new Set(items.map((item) => item.category).filter(Boolean))].slice(0, 3);
  const pages = paginationItems(page, pageCount);

  return (
    <div className="opportunities-board">
      <div className="opportunity-board-head">
        <div>
          <h2>Browse opportunities</h2>
          {items.length > 0 || !loading ? (
            <p className="opportunity-count">
              {total === 0
                ? 'No opportunities to show'
                : `Showing ${rangeFrom}–${rangeTo} of ${total} opportunities`}
            </p>
          ) : (
            <p className="opportunity-count">Loading opportunities…</p>
          )}
        </div>
      </div>

      <form className="opportunity-filters" onSubmit={(event) => event.preventDefault()}>
        {searchField}
        {coreFilters}
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
            placeholder="Search opportunities..."
            aria-label="Search opportunities"
          />
        </div>
        <button
          type="button"
          className="filter-toggle secondary-button on-light"
          onClick={() => setFiltersOpen(true)}
        >
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
              <p>Try removing a filter or searching for a broader skill.</p>
              <button type="button" className="primary-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : null}
          {items.length > 0 && sort === 'match' && matchAvailable
            ? (() => {
                const matched = items.filter((item) => item.match && item.match.score > 0);
                const rest = items.filter((item) => !item.match || item.match.score <= 0);
                return (
                  <>
                    {matched.length > 0 ? (
                      <div className="match-group">
                        <h3 className="match-group-heading">
                          <Target size={18} strokeWidth={2} aria-hidden="true" />
                          Your Matches
                        </h3>
                        {matched.map((item) => (
                          <OpportunityCard key={`${item.listingKind ?? 'curated'}-${item.id}`} opportunity={item} />
                        ))}
                      </div>
                    ) : (
                      <div className="opportunity-empty">
                        <h3>No matches for your profile yet.</h3>
                        <p>Complete your profile to unlock personalized matches, or browse all opportunities below.</p>
                      </div>
                    )}
                    {rest.length > 0 ? (
                      <div className="match-group">
                        <h3 className="match-group-heading is-secondary">Other Opportunities</h3>
                        {rest.map((item) => (
                          <OpportunityCard key={`${item.listingKind ?? 'curated'}-${item.id}`} opportunity={item} />
                        ))}
                      </div>
                    ) : null}
                  </>
                );
              })()
            : items.length > 0
              ? items.map((item) => (
                  <OpportunityCard key={`${item.listingKind ?? 'curated'}-${item.id}`} opportunity={item} />
                ))
              : null}
          {!loading && items.length > 0 && pageCount > 1 ? (
            <nav className="opportunity-pagination" aria-label="Opportunity pages">
              <button
                type="button"
                className="page-nav secondary-button on-light"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                Previous
              </button>
              <div className="page-numbers">
                {pages.map((item, index) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="page-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      className={`page-num${item === page ? ' is-current' : ''}`}
                      onClick={() => setPage(item)}
                      aria-current={item === page ? 'page' : undefined}
                      aria-label={`Page ${item}`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
              <span className="page-status">
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                className="page-nav secondary-button on-light"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                Next
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </nav>
          ) : null}
          <p className="opportunity-disclosure">
            AI Trainers curates external opportunities for discovery and is not the employer. Employer listings are
            collected from public career pages. Always verify requirements and apply on the original platform.
          </p>
        </div>

        <aside className="opportunity-rail">
          <section className="opportunity-rail-card">
            <h3>
              <Target size={18} strokeWidth={2} aria-hidden="true" />
              Find Your Best Fit
            </h3>
            {!user ? (
              <>
                <p>Create a profile to see how well opportunities match your experience and skills.</p>
                <a className="primary-button opportunity-view" href={`/login?returnTo=${encodeURIComponent('/opportunities')}`}>
                  <UserPlus size={16} strokeWidth={2} />
                  Create Your Profile
                </a>
              </>
            ) : !(matchAvailable || readiness?.completeEnough) ? (
              <>
                <p>Complete your profile to unlock personalized matches.</p>
                <a className="primary-button opportunity-view" href="/profile/edit">
                  Complete Profile
                </a>
              </>
            ) : (
              <>
                <p>Your AI Training Readiness</p>
                {readiness ? <p className="fit-score">{Math.min(100, readiness.score)}%</p> : null}
                {topCategories.length ? (
                  <>
                    <p>Top matching areas</p>
                    <ul className="fit-categories">
                      {topCategories.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  </>
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
            <h3>
              <PhoneCall size={18} strokeWidth={2} aria-hidden="true" />
              Need guidance?
            </h3>
            <p>Not sure which opportunities fit you?</p>
            <p>Our coaching team can help you understand where your background fits and what to focus on next.</p>
            <a className="secondary-button on-light opportunity-view" href="/#apply">
              <PhoneCall size={16} strokeWidth={2} />
              Book a Free Intro Call
            </a>
          </section>
        </aside>
      </div>

      {filtersOpen ? (
        <div className="filter-drawer is-sheet" role="dialog" aria-label="Filters">
          <button type="button" className="filter-drawer-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />
          <div className="filter-drawer-panel">
            <div className="filter-sheet-handle" aria-hidden="true" />
            <div className="filter-drawer-head">
              <h2>Filters</h2>
              <button type="button" className="filter-drawer-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                Done
              </button>
            </div>
            <form className="opportunity-filters is-drawer" onSubmit={(event) => event.preventDefault()}>
              {coreFilters}
              {typeFilter}
              {filterCount ? (
                <button type="button" className="filter-clear" onClick={clearFilters}>
                  <X size={16} strokeWidth={2} />
                  Clear Filters
                </button>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
