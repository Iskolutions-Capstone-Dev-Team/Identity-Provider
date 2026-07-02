import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ForgotPasswordOtpStep from '../ForgotPasswordOtpStep';

describe('ForgotPasswordOtpStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ForgotPasswordOtpStep otp={['', '', '', '', '', '']} setOtp={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} error="" isVerifying={false} />);
    expect(container).toBeInTheDocument();
  });
});
