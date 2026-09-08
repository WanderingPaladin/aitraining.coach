'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchLearnProgress, saveLearnProgress } from '../../lib/learn/api';
import { emptyLearnState, mergeRemoteProgress, readLearnState, writeLearnState, type LocalLearnState } from '../../lib/learn/storage';

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

  const update = useCallback((patch: Partial<LocalLearnState>) => {
    const next = writeLearnState(patch);
    setState(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
    void saveLearnProgress({
      currentModule: next.currentModule,
      completedModules: next.completedModules,
      startedModules: next.startedModules,
      quizResults: next.quizResults,
      lastLesson: next.lastLesson,
    }).catch(() => {});
    return next;
  }, []);

  return { state, update, saved, ready };
}
