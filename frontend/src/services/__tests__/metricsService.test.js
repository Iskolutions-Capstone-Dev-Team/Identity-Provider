import { describe, it, expect, vi, beforeEach } from 'vitest';
import { metricsService } from '../metricsService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: { get: vi.fn() }
}));
vi.mock('../../utils/requestCache', () => ({
  getCachedRequest: vi.fn(async (key, fetcher) => fetcher())
}));

describe('metricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches dashboard metrics', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { users: 10 } });
    const res = await metricsService.getDashboardMetrics();
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/metrics');
  });
});
