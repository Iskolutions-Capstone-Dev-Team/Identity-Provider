import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeleteConfirmModal from '../DeleteConfirmModal';

// Mock useModalTransition
vi.mock('../modalTransition', () => ({
  useModalTransition: vi.fn(() => ({ shouldRender: true, isClosing: false })),
  getModalTransitionClassName: vi.fn((base) => base)
}));

describe('DeleteConfirmModal Component', () => {
  it('renders the message', () => {
    render(
      <DeleteConfirmModal open={true} message="Delete this user?" />
    );
    expect(screen.getByText('Delete this user?')).toBeInTheDocument();
  });

  it('calls onConfirm when Delete is clicked', async () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteConfirmModal open={true} onConfirm={handleConfirm} />
    );
    
    const confirmBtn = screen.getByRole('button', { name: /Delete/i });
    await userEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const handleCancel = vi.fn();
    render(
      <DeleteConfirmModal open={true} onCancel={handleCancel} />
    );
    
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalled();
  });
});
