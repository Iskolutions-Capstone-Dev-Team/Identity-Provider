import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCachedRequest, clearCachedRequests } from '../requestCache';

describe('requestCache', () => {
  beforeEach(() => {
    clearCachedRequests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls the factory for a new request', async () => {
    const factory = vi.fn().mockResolvedValue('data1');
    const result = await getCachedRequest('key1', factory);
    expect(result).toBe('data1');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('returns cached promise for concurrent requests', async () => {
    const factory = vi.fn().mockResolvedValue('data1');
    const promise1 = getCachedRequest('key1', factory);
    const promise2 = getCachedRequest('key1', factory);
    
    const [res1, res2] = await Promise.all([promise1, promise2]);
    expect(res1).toBe('data1');
    expect(res2).toBe('data1');
    expect(factory).toHaveBeenCalledTimes(1); // factory only called once
  });

  it('returns cached data if within cacheMs', async () => {
    const factory = vi.fn().mockResolvedValue('data1');
    await getCachedRequest('key1', factory);
    
    // advance time but less than default 500ms
    vi.advanceTimersByTime(200);
    
    const res = await getCachedRequest('key1', factory);
    expect(res).toBe('data1');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('calls factory again if cache is expired', async () => {
    const factory = vi.fn().mockResolvedValue('data1');
    await getCachedRequest('key1', factory, { cacheMs: 500 });
    
    vi.advanceTimersByTime(600);
    
    await getCachedRequest('key1', factory, { cacheMs: 500 });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('clears specific prefixes', async () => {
    const factory = vi.fn().mockResolvedValue('data');
    await getCachedRequest('prefix1:key', factory);
    await getCachedRequest('prefix2:key', factory);
    
    clearCachedRequests('prefix1:');
    
    await getCachedRequest('prefix1:key', factory); // Should call factory again
    await getCachedRequest('prefix2:key', factory); // Should hit cache
    
    expect(factory).toHaveBeenCalledTimes(3); 
    // Initial (2) + prefix1 retry (1) + prefix2 cache (0) = 3
  });
});
