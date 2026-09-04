import type { Metadata } from 'next';
import { Suspense } from 'react';
import OpportunitiesBoard from '../components/OpportunitiesBoard';
import { fetchPublicJobsServer } from '../../lib/api';
import { siteIcons } from '../../lib/siteIcons';

export const metadata: Metadata = {
  title: 'AI Training Opportunities | AI Trainers',
  description:
    'Explore AI-training opportunities across professional domains and discover roles that may align with your background.',
  icons: siteIcons,
};

type OpportunitiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(paramValue(params.page)) || 1);
  const hasFilters = Boolean(
    paramValue(params.q) ||
      paramValue(params.platform) ||
      paramValue(params.company) ||
      paramValue(params.category) ||
      paramValue(params.experience) ||
      paramValue(params.employmentType) ||
      paramValue(params.remote) ||
      paramValue(params.pay) ||
      paramValue(params.postedWithin) ||
      paramValue(params.sort),
  );
  const initialJobs = hasFilters
    ? null
    : await fetchPublicJobsServer({ page, pageSize: 20 });

  return (
    <main className="journal-page" id="top">
      <Suspense
        fallback={
          <div className="journal-light">
            <div className="shell journal-main">
              <div className="opportunity-skeleton-list" aria-hidden="true">
                <div className="opportunity-card is-skeleton" />
                <div className="opportunity-card is-skeleton" />
                <div className="opportunity-card is-skeleton" />
              </div>
            </div>
          </div>
        }
      >
        <OpportunitiesBoard initialJobs={initialJobs} />
      </Suspense>
    </main>
  );
}
