import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ErrorAlert from '../ErrorAlert';

describe('ErrorAlert Component', () => {
  it('renders the message when provided', async () => {
    render(<ErrorAlert message="Invalid credentials" />);
    
    // The component has a slight animation delay (10ms) before visibility,
    // so we use waitFor or just findByText if we are checking DOM presence.
    const messageElement = await screen.findByText('Invalid credentials');
    expect(messageElement).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<ErrorAlert message="Error occurred" onClose={handleClose} />);
    
    const closeButton = await screen.findByRole('button', { name: /close alert/i });
    expect(closeButton).toBeInTheDocument();
    
    await userEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render if no message is provided', () => {
    const { container } = render(<ErrorAlert message="" />);
    expect(container.firstChild).toBeNull();
  });
});
