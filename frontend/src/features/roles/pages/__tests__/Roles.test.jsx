import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Roles from '../Roles';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('Roles Page', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('renders without crashing', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
