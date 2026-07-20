import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SuccessAlert from '../SuccessAlert';

describe('SuccessAlert Component', () => {
  it('renders the message when provided', async () => {
    render(<SuccessAlert message="Login successful" />);
    const messageElement = await screen.findByText('Login successful');
    expect(messageElement).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<SuccessAlert message="Success" onClose={handleClose} />);
    const closeButton = await screen.findByRole('button', { name: /close alert/i });
    expect(closeButton).toBeInTheDocument();
    
    await userEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render if no message is provided', () => {
    // using queryByRole since query selector doesn't throw if not found
    render(<SuccessAlert message="" />);
    const alertElement = screen.queryByRole('alert');
    expect(alertElement).not.toBeInTheDocument();
  });
});
