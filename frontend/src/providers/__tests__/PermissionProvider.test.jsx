import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PermissionProvider, usePermissionAccess } from '../PermissionProvider';
import { permissionService } from '../../services/permissionService';
import React from 'react';

vi.mock('../../services/permissionService', () => ({
  permissionService: {
    getCurrentUserPermissions: vi.fn()
  }
}));

const TestComponent = () => {
  const { permissions, isLoadingPermissions, hasPermission, hasAnyPermission } = usePermissionAccess();
  
  if (isLoadingPermissions) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="perms-length">{permissions.length}</div>
      <div data-testid="has-admin">{hasPermission('admin') ? 'yes' : 'no'}</div>
      <div data-testid="has-any">{hasAnyPermission(['admin', 'user']) ? 'yes' : 'no'}</div>
    </div>
  );
};

describe('PermissionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides permissions from service', async () => {
    permissionService.getCurrentUserPermissions.mockResolvedValue(['admin', 'editor']);
    
    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByTestId('perms-length')).toHaveTextContent('2');
    expect(screen.getByTestId('has-admin')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-any')).toHaveTextContent('yes');
  });

  it('handles service errors gracefully', async () => {
    permissionService.getCurrentUserPermissions.mockRejectedValue(new Error('Network error'));
    
    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByTestId('perms-length')).toHaveTextContent('0');
    expect(screen.getByTestId('has-admin')).toHaveTextContent('no');
  });

  it('throws an error if usePermissionAccess is used outside of provider', () => {
    // Suppress console.error for the expected React error boundary throw
    const originalError = console.error;
    console.error = vi.fn();
    
    expect(() => render(<TestComponent />)).toThrow('usePermissionAccess must be used inside a PermissionProvider');
    
    console.error = originalError;
  });
});
