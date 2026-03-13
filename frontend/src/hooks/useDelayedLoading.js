import { useEffect, useRef, useState } from "react";

const DEFAULT_DELAY_MS = 2000;

export function useDelayedLoading(isLoading, delayMs = DEFAULT_DELAY_MS) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadingStartRef = useRef(0);

  useEffect(() => {
    let timeoutId;

    if (isLoading) {
      loadingStartRef.current = Date.now();
      setShowLoading(true);
      return undefined;
    }

    const elapsedTime = Date.now() - loadingStartRef.current;
    const remainingDelay = Math.max(delayMs - elapsedTime, 0);

    timeoutId = window.setTimeout(() => {
      setShowLoading(false);
    }, remainingDelay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, isLoading]);

  return showLoading;
}