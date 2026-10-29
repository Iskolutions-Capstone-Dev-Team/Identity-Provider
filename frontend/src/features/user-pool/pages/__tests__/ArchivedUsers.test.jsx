import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ArchivedUsers from '../ArchivedUsers';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

vi.mock('../hooks/useArchivedUsers', () => ({
  useArchivedUsers: () => ({
    search: '',
    setSearch: vi.fn(),
    sortBy: 'created_at',
    setSortBy: vi.fn(),
    sort: 'desc',
    setSort: vi.fn(),
    page: 1,
    setPage: vi.fn(),
    paginatedUsers: [],
    totalPages: 1,
    totalResults: 0,
    successMessage: '',
    setSuccessMessage: vi.fn(),
    fetchError: '',
    setFetchError: vi.fn(),
    loading: false,
    unarchiveUser: vi.fn(),
    hardDeleteUser: vi.fn(),
  })
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('ArchivedUsers Page', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ArchivedUsers />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(container).toBeInTheDocument();
  });
});

