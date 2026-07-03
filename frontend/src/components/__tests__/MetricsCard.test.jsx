import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricsCard from '../MetricsCard';

describe('MetricsCard Component', () => {
  it('renders nothing if metrics are empty and not loading', () => {
    const { container } = render(<MetricsCard metrics={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders loading skeletons when isLoading is true', () => {
    const { container } = render(<MetricsCard isLoading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders metric data correctly', () => {
    const metrics = [
      { title: 'Total Users', value: 1200, description: 'Active users' }
    ];
    
    render(<MetricsCard metrics={metrics} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument(); // Checks if number is formatted
    expect(screen.getByText('Active users')).toBeInTheDocument();
  });
});
