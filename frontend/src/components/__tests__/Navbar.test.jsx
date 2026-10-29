import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '../Navbar';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function renderNavbar(props = {}) {
  return render(
    <MemoryRouter>
      <SidebarProvider>
        <Navbar {...props} />
      </SidebarProvider>
    </MemoryRouter>
  );
}

describe('Navbar Component', () => {
  it('renders the theme toggle button if showColorModeToggle is true', () => {
    renderNavbar({ showColorModeToggle: true, activeColorMode: "light", onToggleColorMode: () => {} });
    expect(screen.getByRole('button', { name: /Switch page to dark mode/i })).toBeInTheDocument();
  });

  it('hides the theme toggle button if showColorModeToggle is false', () => {
    renderNavbar({ showColorModeToggle: false });
    expect(screen.queryByRole('button', { name: /Switch page to/i })).not.toBeInTheDocument();
  });

  it('does not render the settings menu or view selector', () => {
    renderNavbar({ showColorModeToggle: true });
    expect(screen.queryByLabelText(/Settings/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Appearance/i)).not.toBeInTheDocument();
  });

  it('calls onToggleColorMode when theme button is clicked', async () => {
    const handleToggle = vi.fn();
    renderNavbar({ showColorModeToggle: true, activeColorMode: "light", onToggleColorMode: handleToggle });
    
    const toggleBtn = screen.getByRole('button', { name: /Switch page to dark mode/i });
    await userEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('navigates to /profile when profile button is clicked', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    renderNavbar({
      currentUser: {
        given_name: "John",
        family_name: "Doe",
        email: "john@example.com",
      },
    });
    
    const profileTrigger = screen.getByText('John Doe');
    await userEvent.click(profileTrigger);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
