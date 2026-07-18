import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CreateAppClientPage from '../CreateAppClientPage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('CreateAppClientPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><CreateAppClientPage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
