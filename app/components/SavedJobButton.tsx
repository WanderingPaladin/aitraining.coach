'use client';

import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isJobSaved, SAVED_JOBS_EVENT, toggleSavedJob } from '../../lib/savedJobs';
import { trackEvent } from '../../lib/tracking';

export default function SavedJobButton({
  jobId,
  title,
}: {
  jobId: string;
  title: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    function sync() {
      setSaved(isJobSaved(jobId));
    }
    sync();
    window.addEventListener(SAVED_JOBS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SAVED_JOBS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [jobId]);

  return (
    <button
      type="button"
      className={`save-button${saved ? ' is-saved' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved jobs` : `Save ${title}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = toggleSavedJob(jobId);
        setSaved(next);
        if (next) {
          trackEvent({ eventType: 'opportunity_saved', opportunityId: jobId });
        }
      }}
    >
      <Bookmark size={18} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
