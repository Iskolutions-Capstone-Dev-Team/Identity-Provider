import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleService } from '../roleService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));

vi.mock('../../utils/requestCache', () => ({
  clearCachedRequests: vi.fn(),
  getCachedRequest: vi.fn(async (key, fetcher) => fetcher())
}));

describe('roleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches roles', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { items: [] } });
    await roleService.getRoles();
    expect(axiosInstance.get).toHaveBeenCalled();
  });
});
