import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

// Mock Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

// Mock Permissions
vi.mock('../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({
    hasAnyPermission: vi.fn(() => true), // allow all sections
    isLoadingPermissions: false
  })
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the brand logo and title', () => {
    render(
      <MemoryRouter>
        <Sidebar isOpen={true} toggleSidebar={() => {}} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('PUPTIDP')).toBeInTheDocument();
    expect(screen.getByAltText('IDP Logo')).toBeInTheDocument();
  });

  it('renders the main menu items based on permissions', () => {
    render(
      <MemoryRouter>
        <Sidebar isOpen={true} toggleSidebar={() => {}} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Pool')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('navigates when a menu item is clicked', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} toggleSidebar={() => {}} />
      </MemoryRouter>
    );
    
    // We expect the first "User Pool" button to trigger navigation
    // Since there is a mobile menu and desktop menu, getAllByText might return multiple, but we click the button
    const userPoolBtn = screen.getAllByRole('button', { name: 'User Pool' })[0];
    await userEvent.click(userPoolBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/user-pool');
  });

  it('navigates to logout when Logout is clicked', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} toggleSidebar={() => {}} currentUser={{ id: '123' }} />
      </MemoryRouter>
    );
    
    const logoutBtn = screen.getAllByRole('button', { name: 'Logout' })[0];
    await userEvent.click(logoutBtn);
    
    expect(mockNavigate).toHaveBeenCalled();
  });
});
