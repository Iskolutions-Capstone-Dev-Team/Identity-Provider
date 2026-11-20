import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQ from '../FAQ';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

vi.mock('../../../../hooks/useDelayedLoading', () => ({
  useDelayedLoading: () => false,
}));

describe('FAQ Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><FAQ /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });

  it('renders Backup & Restore tab trigger and questions when clicked', () => {
    render(<BrowserRouter><FAQ /></BrowserRouter>);
    const backupTab = screen.getByRole('tab', { name: /Backup & Restore/i });
    expect(backupTab).toBeInTheDocument();

    fireEvent.click(backupTab);
    expect(screen.getByText('What is Backup & Restore for?')).toBeInTheDocument();
    expect(screen.getByText(/How do I create a new system backup\?/i)).toBeInTheDocument();
    expect(screen.getByText(/What does Log Retention & Purge do\?/i)).toBeInTheDocument();
  });
});
