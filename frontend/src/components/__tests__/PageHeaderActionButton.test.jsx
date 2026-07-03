import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PageHeaderActionButton from '../PageHeaderActionButton';

describe('PageHeaderActionButton Component', () => {
  it('renders children correctly', () => {
    render(<PageHeaderActionButton>Click Me</PageHeaderActionButton>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<PageHeaderActionButton onClick={handleClick}>Action</PageHeaderActionButton>);
    
    const button = screen.getByRole('button', { name: 'Action' });
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies dark mode classes when colorMode is dark', () => {
    render(<PageHeaderActionButton colorMode="dark">Dark</PageHeaderActionButton>);
    const button = screen.getByRole('button', { name: 'Dark' });
    expect(button.className).toContain('bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)]');
  });

  it('applies light mode classes by default', () => {
    render(<PageHeaderActionButton>Light</PageHeaderActionButton>);
    const button = screen.getByRole('button', { name: 'Light' });
    expect(button.className).toContain('bg-[#7b0d15]');
  });
});
