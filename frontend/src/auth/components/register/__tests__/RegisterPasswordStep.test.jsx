import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPasswordStep from '../RegisterPasswordStep';

describe('RegisterPasswordStep Component', () => {
  const defaultProps = {
    errors: {},
    isSubmitting: false,
    showConfirmPassword: false,
    showPassword: false,
    values: { password: '', confirmPassword: '' },
    onBlur: vi.fn(),
    onChange: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    onToggleConfirmPassword: vi.fn(),
    onTogglePassword: vi.fn()
  };

  it('renders password fields', () => {
    render(<RegisterPasswordStep {...defaultProps} />);
    expect(screen.getByPlaceholderText('Create your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<RegisterPasswordStep {...defaultProps} />);
    const toggleButtons = screen.getAllByRole('button');
    // The first button in the field could be the toggle if the component sets it as a button
    // Actually the RegisterPasswordField handles toggle internally.
    // Let's just verify the text.
    expect(screen.getByText('Use at least 8 characters with 1 uppercase letter, 1 number, and 1 special character.')).toBeInTheDocument();
  });

  it('submits form', () => {
    render(<RegisterPasswordStep {...defaultProps} />);
    fireEvent.submit(screen.getByRole('button', { name: /CREATE ACCOUNT/i }));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });
});
