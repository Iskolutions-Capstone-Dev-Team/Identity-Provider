import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CreateRolePage from '../CreateRolePage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    permissions: [],
    loading: false
  })
}));

vi.mock('../../hooks/useRoles', () => ({
  useRoles: () => ({
    createRole: vi.fn()
  })
}));

describe('CreateRolePage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><CreateRolePage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
