import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Navbar Component', () => {
  it('renders the theme toggle button if showColorModeToggle is true', () => {
    render(
      <MemoryRouter>
        <Navbar showColorModeToggle={true} activeColorMode="light" onToggleColorMode={() => {}} />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('button', { name: /Switch page to dark mode/i })).toBeInTheDocument();
  });

  it('hides the theme toggle button if showColorModeToggle is false', () => {
    render(
      <MemoryRouter>
        <Navbar showColorModeToggle={false} />
      </MemoryRouter>
    );
    
    expect(screen.queryByRole('button', { name: /Switch page to/i })).not.toBeInTheDocument();
  });

  it('calls onToggleColorMode when theme button is clicked', async () => {
    const handleToggle = vi.fn();
    render(
      <MemoryRouter>
        <Navbar showColorModeToggle={true} activeColorMode="light" onToggleColorMode={handleToggle} />
      </MemoryRouter>
    );
    
    const toggleBtn = screen.getByRole('button', { name: /Switch page to dark mode/i });
    await userEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('navigates to /profile when profile button is clicked', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    
    const profileBtn = screen.getByRole('button', { name: /Open profile/i });
    await userEvent.click(profileBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
