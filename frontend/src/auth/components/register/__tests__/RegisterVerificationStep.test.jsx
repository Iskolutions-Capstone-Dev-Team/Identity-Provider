import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterVerificationStep from '../RegisterVerificationStep';

describe('RegisterVerificationStep Component', () => {
  const defaultProps = {
    code: ['1', '2', '3', '4', '5', '6'],
    error: '',
    inputsRef: { current: [] },
    isResending: false,
    isVerifying: false,
    resendTimer: 0,
    onChange: vi.fn(),
    onKeyDown: vi.fn(),
    onPaste: vi.fn(),
    onResend: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault())
  };

  it('renders verification inputs', () => {
    render(<RegisterVerificationStep {...defaultProps} />);
    expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
    expect(inputs[0]).toHaveValue('1');
  });

  it('allows resend when timer is 0', () => {
    render(<RegisterVerificationStep {...defaultProps} resendTimer={0} />);
    const resendBtn = screen.getByText('Resend');
    expect(resendBtn).not.toBeDisabled();
    fireEvent.click(resendBtn);
    expect(defaultProps.onResend).toHaveBeenCalled();
  });

  it('submits form', () => {
    render(<RegisterVerificationStep {...defaultProps} />);
    fireEvent.submit(screen.getByRole('button', { name: /VERIFY & CONTINUE/i }));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });
});
