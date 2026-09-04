const STORAGE_KEY = 'aitrainers.saved-jobs';
export const SAVED_JOBS_EVENT = 'aitrainers:saved-jobs';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readSavedJobIds(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
  } catch {
    return [];
  }
}

export function isJobSaved(id: string): boolean {
  return readSavedJobIds().includes(id);
}

export function toggleSavedJob(id: string): boolean {
  const current = readSavedJobIds();
  const exists = current.includes(id);
  const next = exists ? current.filter((item) => item !== id) : [...current, id];
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SAVED_JOBS_EVENT, { detail: { id, saved: !exists } }));
  }
  return !exists;
}
