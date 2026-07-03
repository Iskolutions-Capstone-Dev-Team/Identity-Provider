import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OtpVerificationStep from '../OtpVerificationStep';

describe('OtpVerificationStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<OtpVerificationStep otp={['', '', '', '', '', '']} email="test@example.com" onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
