import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MfaVerifyStep from '../MfaVerifyStep';

describe('MfaVerifyStep Component', () => {
  const defaultProps = {
    email: 'test@example.com',
    code: '',
    mode: 'authenticator',
    hasSentOtp: false,
    isSendingOtp: false,
    isVerifying: false,
    isCheckingAuthenticators: false,
    isCheckingPasskey: false,
    onSelectEmail: vi.fn(),
    onSelectAuthenticator: vi.fn(),
    onSelectPasskey: vi.fn(),
    onCodeChange: vi.fn(),
    onSendOtp: vi.fn(),
    onVerify: vi.fn((e) => e.preventDefault()),
    onCancel: vi.fn()
  };

  it('renders MFA header', () => {
    render(<MfaVerifyStep {...defaultProps} />);
    expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<MfaVerifyStep {...defaultProps} mode="authenticator" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Authenticator app')).toBeInTheDocument();
    expect(screen.getByText('Passkey')).toBeInTheDocument();
  });

  it('handles cancel click', () => {
    render(<MfaVerifyStep {...defaultProps} />);
    fireEvent.click(screen.getByText('Back to login'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});
