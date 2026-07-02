import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Profile from '../Profile';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('Profile Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><Profile /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
