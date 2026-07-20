import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddUserForm from '../AddUserForm';

vi.mock('../../../../providers/PermissionProvider', () => ({
  usePermissionAccess: vi.fn(() => ({ hasPermission: () => true }))
}));

describe('AddUserForm Component', () => {
  it('renders form fields', () => {
    render(<AddUserForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });
});
