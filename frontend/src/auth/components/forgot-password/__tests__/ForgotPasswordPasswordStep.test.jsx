import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForgotPasswordPasswordStep from '../ForgotPasswordPasswordStep';

describe('ForgotPasswordPasswordStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ForgotPasswordPasswordStep
        form={{ newPassword: '', confirmPassword: '' }}
        validation={{ checks: {} }}
        setForm={vi.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });


  it('renders hint indicating password cannot match last 5 passwords', () => {
    render(
      <ForgotPasswordPasswordStep
        form={{ newPassword: '', confirmPassword: '' }}
        validation={{ checks: {} }}
        setForm={vi.fn()}
      />
    );
    expect(
      screen.getByText('Must be different from your last 5 passwords.')
    ).toBeInTheDocument();
  });

  it('renders error message when errorMessage prop is provided', () => {
    render(
      <ForgotPasswordPasswordStep
        form={{ newPassword: '', confirmPassword: '' }}
        validation={{ checks: {} }}
        setForm={vi.fn()}
        errorMessage="You cannot reuse any of your last 5 passwords."
      />
    );
    expect(
      screen.getByText('You cannot reuse any of your last 5 passwords.')
    ).toBeInTheDocument();
  });
});
