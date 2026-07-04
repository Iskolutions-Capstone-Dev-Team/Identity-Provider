import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import UserPool from '../UserPool';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

vi.mock('../../hooks/useUsers', () => ({
  useUsers: () => ({
    search: '',
    setSearch: vi.fn(),
    userType: 'regular',
    setUserType: vi.fn(),
    status: '',
    setStatus: vi.fn(),
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
    getUserDetails: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  })
}));

vi.mock('../../../app-clients/hooks/useAllAppClients', () => ({
  useAllAppClients: () => ({
    appClients: [],
    isLoadingAppClients: false,
  })
}));

vi.mock('../../../../services/metricsService', () => ({
  metricsService: {
    getUserMetrics: vi.fn().mockResolvedValue([])
  }
}));

describe('UserPool Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><UserPool /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
