"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Runs an async loader on mount and whenever `deps` change; `reload()` runs it again after a change. */
export function useData<T>(load: () => PromiseLike<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data?: T; error: string | null }>({ error: null });
  const [tick, setTick] = useState(0);
  const latest = useRef(load);
  useEffect(() => {
    latest.current = load;
  });
  const key = JSON.stringify(deps);
  useEffect(() => {
    let live = true;
    Promise.resolve(latest.current()).then(
      (data) => live && setState({ data, error: null }),
      (e: Error) => live && setState((s) => ({ ...s, error: e.message })),
    );
    return () => {
      live = false;
    };
  }, [key, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data: state.data, error: state.error, reload };
}

/** Wraps a form/button action: tracks busy state and shows its error. Returns true on success. */
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
