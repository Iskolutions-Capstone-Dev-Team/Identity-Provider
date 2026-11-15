import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AuditLogs from '../AuditLogs';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('AuditLogs Page', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuditLogs />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
