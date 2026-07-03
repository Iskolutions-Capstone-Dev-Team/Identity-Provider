import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardPanel from '../DashboardPanel';

describe('DashboardPanel', () => {
  it('renders children correctly', () => {
    render(
      <DashboardPanel>
        <div data-testid="child">Panel Content</div>
      </DashboardPanel>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('applies dark mode classes when colorMode is dark', () => {
    const { container } = render(
      <DashboardPanel colorMode="dark">
        <div />
      </DashboardPanel>
    );
    
    expect(container.firstChild.className).toContain('bg-[#07172b]/72');
  });

  it('applies light mode classes by default', () => {
    const { container } = render(
      <DashboardPanel>
        <div />
      </DashboardPanel>
    );
    
    expect(container.firstChild.className).toContain('bg-white/80');
  });
});
