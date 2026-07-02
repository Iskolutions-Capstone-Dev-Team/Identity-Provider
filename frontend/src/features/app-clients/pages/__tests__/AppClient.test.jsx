import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AppClient from '../AppClient';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useOutletContext: () => ({ colorMode: "light" }) };
});

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

describe('AppClient Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><AppClient /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
