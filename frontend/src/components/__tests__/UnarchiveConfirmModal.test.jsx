import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import UnarchiveConfirmModal from '../UnarchiveConfirmModal';

describe('UnarchiveConfirmModal Component', () => {
  it('renders the message', () => {
    render(
      <UnarchiveConfirmModal open={true} message="Restore this user?" />
    );
    expect(screen.getByText('Restore this user?')).toBeInTheDocument();
  });

  it('renders JSX message elements with row break', () => {
    render(
      <UnarchiveConfirmModal
        open={true}
        message={
          <>
            <span>Restore</span>
            <span className="block break-all">test_long_email_123456789@example.com?</span>
          </>
        }
      />
    );
    expect(screen.getByRole('heading', { name: /Restore/i })).toBeInTheDocument();
    expect(screen.getByText('test_long_email_123456789@example.com?')).toBeInTheDocument();
  });

  it('calls onConfirm when Restore is clicked', async () => {
    const handleConfirm = vi.fn();
    render(
      <UnarchiveConfirmModal open={true} onConfirm={handleConfirm} />
    );
    
    const confirmBtn = screen.getByRole('button', { name: /Restore/i });
    await userEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const handleCancel = vi.fn();
    render(
      <UnarchiveConfirmModal open={true} onCancel={handleCancel} />
    );
    
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalled();
  });
});
