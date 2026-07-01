import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PermissionRoute from '../PermissionRoute';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../providers/PermissionProvider', () => ({
  usePermissionAccess: vi.fn(() => ({ hasAnyPermission: vi.fn(() => true) }))
}));

describe('PermissionRoute Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><PermissionRoute permission="test"><div>Test</div></PermissionRoute></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
