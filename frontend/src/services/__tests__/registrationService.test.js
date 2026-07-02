import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registrationService } from '../registrationService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));

vi.mock('../../utils/requestCache', () => ({
  clearCachedRequests: vi.fn(),
  getCachedRequest: vi.fn(async (key, fetcher) => fetcher())
}));

describe('registrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches registrations', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { items: [] } });
    await registrationService.getRegistrationConfig();
    expect(axiosInstance.get).toHaveBeenCalled();
  });
});
