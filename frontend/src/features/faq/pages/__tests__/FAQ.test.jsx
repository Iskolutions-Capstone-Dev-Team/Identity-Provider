import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import FAQ from '../FAQ';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('FAQ Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><FAQ /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
