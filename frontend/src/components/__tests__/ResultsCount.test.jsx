import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsCount from '../ResultsCount';

describe('ResultsCount Component', () => {
  it('calculates and renders the correct result range', () => {
    render(
      <ResultsCount 
        page={2} 
        itemsPerPage={10} 
        totalResults={25} 
        currentResultsCount={10} 
      />
    );
    
    // The component displays: Showing 11 to 20 of 25 results
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('handles empty results gracefully', () => {
    render(
      <ResultsCount 
        page={1} 
        itemsPerPage={10} 
        totalResults={0} 
        currentResultsCount={0} 
      />
    );
    
    // Displays: Showing 0 to 0 of 0 results
    const zeroes = screen.getAllByText('0');
    expect(zeroes.length).toBeGreaterThanOrEqual(3);
  });

  it('applies dark mode glass styling', () => {
    const { container } = render(
      <ResultsCount page={1} itemsPerPage={10} totalResults={5} currentResultsCount={5} variant="glass" colorMode="dark" />
    );
    
    // Container should have dark mode specific classes
    expect(container.firstChild.className).toContain('bg-white/[0.04]');
  });
});
