import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import InfoAlert from '../InfoAlert';

describe('InfoAlert Component', () => {
  it('renders the message when provided', async () => {
    render(<InfoAlert message="Some info message" />);
    
    // The component has a slight animation delay (10ms) before visibility
    const messageElement = await screen.findByText('Some info message');
    expect(messageElement).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<InfoAlert message="Info occurred" onClose={handleClose} />);
    
    const closeButton = await screen.findByRole('button', { name: /close alert/i });
    expect(closeButton).toBeInTheDocument();
    
    await userEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render if no message is provided', () => {
    const { container } = render(<InfoAlert message="" />);
    expect(container.firstChild).toBeNull();
  });
});
