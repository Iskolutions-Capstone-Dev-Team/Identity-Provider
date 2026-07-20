import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricFilterCard from '../MetricFilterCard';

describe('MetricFilterCard', () => {
  const mockStat = {
    label: 'Total Logins',
    count: 1234
  };

  it('renders the stat label and count', () => {
    render(<MetricFilterCard stat={mockStat} />);
    
    expect(screen.getByText(/Total Logins/i)).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders skeleton when isLoading is true', () => {
    const { container } = render(<MetricFilterCard stat={mockStat} isLoading={true} />);
    
    expect(screen.queryByText('1,234')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('applies dark mode classes when colorMode is dark', () => {
    const { container } = render(<MetricFilterCard stat={mockStat} colorMode="dark" />);
    
    expect(container.firstChild.className).toContain('bg-[#061529]/78');
  });
});
