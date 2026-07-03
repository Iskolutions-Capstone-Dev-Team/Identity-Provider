import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmailStatus from '../EmailStatus';

describe('EmailStatus', () => {
  it('renders correctly', () => {
    render(<EmailStatus />);
    
    expect(screen.getByText('Email Status')).toBeInTheDocument();
    expect(screen.getByText('Current email delivery status')).toBeInTheDocument();
    expect(screen.getByText('Email Active')).toBeInTheDocument();
  });

  it('applies dark mode classes when colorMode is dark', () => {
    const { container } = render(<EmailStatus colorMode="dark" />);
    
    // Check for a known dark mode class on the card container
    expect(container.firstChild.className).toContain('bg-[linear-gradient');
  });

  it('applies light mode classes by default', () => {
    const { container } = render(<EmailStatus colorMode="light" />);
    
    // Check for a known light mode class on the card container
    expect(container.firstChild.className).toContain('bg-white/80');
  });
});
