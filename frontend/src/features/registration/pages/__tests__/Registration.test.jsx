import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Registration from '../Registration';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('Registration Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><Registration /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
