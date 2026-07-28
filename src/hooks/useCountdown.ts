import { useEffect, useState } from 'react';

/**
 * Ticks once per second toward `targetEpochMs`.
 * Returns the remaining milliseconds (clamped at 0) and a `done` flag.
 * Pass `null` to disable (remaining = 0, done = true).
 */
export function useCountdown(targetEpochMs: number | null) {
  const compute = () => (targetEpochMs ? Math.max(0, targetEpochMs - Date.now()) : 0);
  const [remaining, setRemaining] = useState(compute);

  useEffect(() => {
    if (!targetEpochMs) {
      setRemaining(0);
      return;
    }
    setRemaining(compute);
    const id = setInterval(() => {
      const next = Math.max(0, targetEpochMs - Date.now());
      setRemaining(next);
      if (next === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetEpochMs]);

  return { remaining, done: remaining === 0 };
}
