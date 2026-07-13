import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mfaService } from '../mfaService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() }
}));

describe('mfaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes authenticator', async () => {
    axiosInstance.delete.mockResolvedValueOnce({ data: { success: true } });
    await mfaService.deleteAuthenticator({ email: 'test@example.com', id: '1' });
    expect(axiosInstance.delete).toHaveBeenCalled();
  });
});
