import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChangePasswordStep, { getPasswordValidationState } from '../ChangePasswordStep';

describe('ChangePasswordStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ChangePasswordStep form={{}} onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container).toBeInTheDocument();
  });

  it('rejects password validation if new password matches current password', () => {
    const form = {
      currentPassword: 'Password123!',
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    };
    const state = getPasswordValidationState(form);
    expect(state.isDifferentFromCurrent).toBe(false);
    expect(state.isValid).toBe(false);
  });

  it('accepts password validation if new password is valid and different from current', () => {
    const form = {
      currentPassword: 'Password123!',
      newPassword: 'BrandNewPassword456!',
      confirmPassword: 'BrandNewPassword456!',
    };
    const state = getPasswordValidationState(form);
    expect(state.isDifferentFromCurrent).toBe(true);
    expect(state.isValid).toBe(true);
  });

  it('renders warning message when new password matches current password', () => {
    const form = {
      currentPassword: 'Password123!',
      newPassword: 'Password123!',
      confirmPassword: '',
    };
    render(
      <ChangePasswordStep
        form={form}
        setForm={vi.fn()}
        showCurrentPassword={true}
      />
    );
    expect(
      screen.getByText('New password cannot be the same as your current password.')
    ).toBeInTheDocument();
  });
});
