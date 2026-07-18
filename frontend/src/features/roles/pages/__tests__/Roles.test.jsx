import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Roles from '../Roles';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('Roles Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><Roles /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
