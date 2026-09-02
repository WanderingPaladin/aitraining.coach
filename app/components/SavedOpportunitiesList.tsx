'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, listSavedOpportunities, type Opportunity } from '../../lib/api';
import { useAuth } from '../components/AuthProvider';
import OpportunityCard from '../components/OpportunityCard';

export default function SavedOpportunitiesList() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/saved-opportunities');
      return;
    }
    void listSavedOpportunities()
      .then((result) => setItems(result.opportunities))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login?next=/saved-opportunities');
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not load saved opportunities.');
      });
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="opportunity-empty">Loading…</p>;
  }

  return (
    <div className="opportunity-results">
      {error ? <p className="apply-field-error">{error}</p> : null}
      {items.length === 0 ? (
        <p className="opportunity-empty">
          No saved opportunities yet. Browse the <a href="/opportunities">opportunities board</a> and bookmark listings to review later.
        </p>
      ) : (
        items.map((item) => (
          <OpportunityCard
            key={item.id}
            opportunity={item}
            onSavedChange={(id, saved) => {
              if (!saved) setItems((current) => current.filter((row) => row.id !== id));
            }}
          />
        ))
      )}
    </div>
  );
}
