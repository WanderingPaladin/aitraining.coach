'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchLearnProgress, saveLearnProgress } from '../../lib/learn/api';
import {
  emptyLearnState,
  mergeRemoteProgress,
  quizResultsWithLabs,
  readLearnState,
  writeLearnState,
  type LocalLearnState,
} from '../../lib/learn/storage';

export function useLearnProgress() {
  const [state, setState] = useState<LocalLearnState>(emptyLearnState);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const local = readLearnState();
    setState(local);
    fetchLearnProgress()
      .then((remote) => {
        if (!active) return;
        const merged = writeLearnState(mergeRemoteProgress(local, remote));
        setState(merged);
      })
      .catch(() => {
        if (active) setState(readLearnState());
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: LocalLearnState) => {
    const result = await saveLearnProgress({
      currentModule: next.currentModule,
      completedModules: next.completedModules,
      startedModules: next.startedModules,
      completedLabs: next.completedLabs,
      quizResults: quizResultsWithLabs(next.quizResults, next.completedLabs),
      lastLesson: next.lastLesson,
    });
    const merged = writeLearnState(mergeRemoteProgress(next, result.progress));
    setState(merged);
    return merged;
  }, []);

  const update = useCallback((patch: Partial<LocalLearnState>) => {
    const next = writeLearnState(patch);
    setState(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
    void persist(next).catch(() => {});
    return next;
  }, [persist]);

  const updateAndPersist = useCallback(async (patch: Partial<LocalLearnState>) => {
    const previous = readLearnState();
    const next = writeLearnState(patch);
    setState(next);
    try {
      const savedState = await persist(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
      return savedState;
    } catch (error) {
      const rolled = writeLearnState(previous);
      setState(rolled);
      throw error;
    }
  }, [persist]);

  return { state, update, updateAndPersist, saved, ready };
}
