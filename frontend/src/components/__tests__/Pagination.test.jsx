import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
  it('renders nothing if totalPages is 0', () => {
    const { container } = render(<Pagination totalPages={0} currentPage={1} onPageChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the correct number of page buttons', () => {
    render(<Pagination totalPages={4} currentPage={1} onPageChange={() => {}} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls onPageChange when a page is clicked', async () => {
    const handlePageChange = vi.fn();
    render(<Pagination totalPages={4} currentPage={1} onPageChange={handlePageChange} />);
    
    const page2Btn = screen.getByText('2');
    await userEvent.click(page2Btn);
    
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
