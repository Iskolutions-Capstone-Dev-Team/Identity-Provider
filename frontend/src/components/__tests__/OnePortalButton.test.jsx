import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OnePortalButton from '../OnePortalButton';

// Removed vi.mock to use real utility

describe('OnePortalButton Component', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = { replace: vi.fn() };
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.clearAllMocks();
  });

  it('renders the button with the PUP logo', () => {
    render(<OnePortalButton />);
    expect(screen.getByRole('button', { name: 'One Portal' })).toBeInTheDocument();
    
    // Check if image is rendered inside the button
    const img = screen.getByRole('button', { name: 'One Portal' }).querySelector('img');
    expect(img).toHaveAttribute('src', '/assets/images/PUP_Logo.png');
  });

  it('calls location.replace when clicked', async () => {
    render(<OnePortalButton />);
    const button = screen.getByRole('button', { name: 'One Portal' });
    
    await userEvent.click(button);
    expect(window.location.replace).toHaveBeenCalled();
    expect(window.location.replace).toHaveBeenCalledWith(expect.stringContaining('/authorize'));
  });
});
