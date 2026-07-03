import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserPoolTable from '../UserPoolTable';

describe('UserPoolTable Component', () => {
  it('renders table headers', () => {
    // Stub
    render(<UserPoolTable users={[]} isLoading={false} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
