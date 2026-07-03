import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CreateRegistrationConfigPage from '../CreateRegistrationConfigPage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('CreateRegistrationConfigPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><CreateRegistrationConfigPage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
