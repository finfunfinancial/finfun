"use client";
import { useCallback, useEffect, useState } from "react";

/** Runs an async loader on mount (and when deps change); `reload()` runs it again after a change. */
export function useData<T>(load: () => PromiseLike<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(load, deps);
  const reload = useCallback(() => {
    Promise.resolve(run()).then((d) => { setData(d); setError(null); }, (e: Error) => setError(e.message));
  }, [run]);
  useEffect(reload, [reload]);
  return { data, error, reload };
}

/** Wraps a form/button action: tracks busy state, shows its error, and runs `after` on success. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, setError, run };
}
