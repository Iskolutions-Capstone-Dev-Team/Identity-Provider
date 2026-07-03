import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../userService';
import axiosInstance from '../axiosInstance';
import { clearCachedRequests } from '../../utils/requestCache';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

vi.mock('../../utils/requestCache', () => ({
  clearCachedRequests: vi.fn(),
  getCachedRequest: vi.fn(async (key, fetcher) => fetcher())
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMe fetches the current user', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { id: 'me' } });
    const res = await userService.getMe();
    expect(res.id).toBe('me');
    expect(axiosInstance.get).toHaveBeenCalledWith('/me');
  });

  it('updateUserName updates name and clears cache', async () => {
    axiosInstance.patch.mockResolvedValueOnce({ data: { success: true } });
    const res = await userService.updateUserName('u1', { firstName: 'J', lastName: 'D' });
    
    expect(res.success).toBe(true);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/internal/user/u1/name', {
      first_name: 'J',
      middle_name: '',
      last_name: 'D',
      name_suffix: ''
    }, expect.any(Object));
    expect(clearCachedRequests).toHaveBeenCalled();
  });

  it('updateUserName throws if first or last name missing', async () => {
    await expect(userService.updateUserName('u1', { firstName: 'J' }))
      .rejects.toThrow('Last name is required.');
  });
});
