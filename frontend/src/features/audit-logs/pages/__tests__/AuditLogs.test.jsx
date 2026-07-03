import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AuditLogs from '../AuditLogs';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('AuditLogs Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><AuditLogs /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
