import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('Dashboard Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
