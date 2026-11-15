import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BackupRestore from '../BackupRestore';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: () => ({ hasPermission: () => true, hasAnyPermission: () => true, permissions: [] })
}));

vi.mock('../../../../hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ currentUser: { roles: ['Superadmin'] } })
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('BackupRestore Page', () => {
  it('renders tabs and switches between Backup & Restore and Log Retention & Purge', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <BackupRestore />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Header and description
    expect(screen.getByRole('heading', { level: 1, name: 'Backup & Restore' })).toBeInTheDocument();

    // Check tabs exist
    const backupTab = screen.getByRole('tab', { name: /Backup & Restore/i });
    const retentionTab = screen.getByRole('tab', { name: /Log Retention & Purge/i });
    expect(backupTab).toBeInTheDocument();
    expect(retentionTab).toBeInTheDocument();

    // By default, Backup & Restore tab is active
    expect(screen.getByText('Create Backup')).toBeInTheDocument();
    expect(screen.getByText('Restore Backup')).toBeInTheDocument();

    // Switch to Log Retention & Purge tab
    fireEvent.click(retentionTab);

    // Retention card should be visible
    expect(screen.getByText('Retention Policy Settings')).toBeInTheDocument();
    expect(screen.getByText('Run Retention Now')).toBeInTheDocument();
  });
});
