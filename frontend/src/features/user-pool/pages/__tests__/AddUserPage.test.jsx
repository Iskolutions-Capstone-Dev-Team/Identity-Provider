import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AddUserPage from '../AddUserPage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('AddUserPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><AddUserPage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
