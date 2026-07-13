import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mailService } from '../mailService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('mailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends invitation', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });
    const res = await mailService.sendInvitation({ email: 'test@example.com', accountTypeId: 1 });
    expect(res.success).toBe(true);
    expect(axiosInstance.post).toHaveBeenCalledWith('/admin/mail/invitation', expect.any(Object), expect.any(Object));
  });
});
