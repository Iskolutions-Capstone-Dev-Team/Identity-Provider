import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Profile from '../Profile';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('Profile Page', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    window.localStorage.clear();
  });

  it('renders without crashing and displays profile tabs', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Authenticators/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Remembered Devices/i })).toBeInTheDocument();
  });
});
