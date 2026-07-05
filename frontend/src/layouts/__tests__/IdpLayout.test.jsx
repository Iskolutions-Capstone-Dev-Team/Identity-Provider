import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IdpLayout from '../IdpLayout';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
  useOutlet: () => <div data-testid="outlet">Outlet Content</div>
}));

vi.mock('../../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />
}));

vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar" />
}));

vi.mock('../../components/AssistiveFab', () => ({
  default: () => <div data-testid="fab" />
}));

vi.mock('../../components/AccessibilityWidget', () => ({
  default: () => <div data-testid="a11y" />
}));

vi.mock('../../components/TermAgreementModal', () => ({
  default: () => <div data-testid="terms-modal" />
}));

vi.mock('../../hooks/useSidebarState', () => ({
  default: () => ({ sidebarOpen: false, toggleSidebar: vi.fn() })
}));

vi.mock('../../hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    currentUser: null,
    isLoadingCurrentUser: false,
    updateCurrentUser: vi.fn()
  })
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
  writable: true
});

describe('IdpLayout', () => {
  it('renders core layout components and outlet', () => {
    render(<IdpLayout />);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('fab')).toBeInTheDocument();
    expect(screen.getByTestId('a11y')).toBeInTheDocument();
    expect(screen.getByTestId('terms-modal')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
