import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DataTableSkeleton from '../DataTableSkeleton';

describe('DataTableSkeleton Component', () => {
  it('renders the correct number of rows and columns', () => {
    const columns = [
      { header: 'Name', type: 'text' },
      { header: 'Status', type: 'badge' },
      { header: 'Actions', type: 'actions' }
    ];
    
    render(<DataTableSkeleton columns={columns} rows={3} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // 3 columns * 3 rows = 9 td elements
    const cells = screen.getAllByRole('cell', { hidden: true });
    expect(cells.length).toBe(9);
  });
});
