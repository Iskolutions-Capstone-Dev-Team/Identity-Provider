import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LogsTable from '../LogsTable';

describe('LogsTable Component', () => {
  it('renders table headers', () => {
    // Stub
    render(<LogsTable logs={[]} isLoading={false} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
