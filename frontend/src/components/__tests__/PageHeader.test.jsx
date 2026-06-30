import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageHeader from '../PageHeader';

describe('PageHeader Component', () => {
  it('renders the title and description correctly', () => {
    render(<PageHeader title="Dashboard" description="Welcome back" />);
    
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('applies dark mode classes when colorMode is dark', () => {
    render(<PageHeader title="Settings" description="Adjust preferences" colorMode="dark" />);
    
    const titleElement = screen.getByRole('heading', { name: 'Settings' });
    expect(titleElement.className).toContain('text-white');
  });

  it('applies light mode classes by default', () => {
    render(<PageHeader title="Profile" description="User info" />);
    
    const titleElement = screen.getByRole('heading', { name: 'Profile' });
    expect(titleElement.className).toContain('text-[#7b0d15]');
  });
});
