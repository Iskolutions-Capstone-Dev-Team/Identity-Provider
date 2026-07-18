import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import UserPool from '../UserPool';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('UserPool Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><UserPool /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
