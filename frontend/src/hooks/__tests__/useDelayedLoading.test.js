import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDelayedLoading } from '../useDelayedLoading';

describe('useDelayedLoading hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps showLoading true immediately if isLoading is true', () => {
    const { result } = renderHook(() => useDelayedLoading(true, 1000));
    expect(result.current).toBe(true);
  });

  it('delays setting showLoading to false based on delayMs', () => {
    const { result, rerender } = renderHook(({ isLoading }) => useDelayedLoading(isLoading, 1000), {
      initialProps: { isLoading: true }
    });

    expect(result.current).toBe(true);

    // Simulate fast load, turn off loading
    rerender({ isLoading: false });
    
    // Should still be true because minimum delay hasn't passed
    expect(result.current).toBe(true);

    // Advance time by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(true);

    // Advance time by another 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(false);
  });
});
