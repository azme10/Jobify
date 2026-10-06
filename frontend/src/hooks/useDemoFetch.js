import { useEffect, useState } from "react";

// Every "Go deeper" tool panel fetches its data the same way: show the sample
// payload in demo mode, otherwise call the real endpoint and track
// loading/error, ignoring the result if the component unmounts mid-request.
export function useDemoFetch(loadFn, sampleData, isDemo, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemo) {
      setData(sampleData);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    loadFn()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // deps is caller-supplied on purpose: loadFn is a fresh closure each render
  }, deps);

  return { data, loading, error };
}
