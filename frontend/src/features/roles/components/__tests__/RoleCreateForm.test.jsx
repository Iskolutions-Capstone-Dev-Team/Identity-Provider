import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RoleCreateForm from '../RoleCreateForm';

describe('RoleCreateForm Component', () => {
  it('renders form fields', () => {
    render(<RoleCreateForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });
});
