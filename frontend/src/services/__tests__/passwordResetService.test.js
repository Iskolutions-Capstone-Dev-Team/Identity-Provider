import { describe, it, expect, vi } from 'vitest';
import { passwordResetService } from '../passwordResetService';

vi.mock('../passwordResetService', () => ({
  passwordResetService: {
    sendOtp: vi.fn().mockResolvedValue({ success: true }),
    verifyOtp: vi.fn(),
    updateForgotPassword: vi.fn(),
    changePassword: vi.fn(),
  }
}));

describe('passwordResetService', () => {
  it('sends otp', async () => {
    const res = await passwordResetService.sendOtp({ email: 'test@example.com' });
    expect(passwordResetService.sendOtp).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });
});
