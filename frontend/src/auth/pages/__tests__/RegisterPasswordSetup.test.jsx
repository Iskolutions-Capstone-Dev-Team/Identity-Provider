import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPasswordSetup from '../RegisterPasswordSetup';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams({ invitation_code: '123' })],
    Navigate: () => <div data-testid="navigate">Redirecting...</div>
  };
});

describe('RegisterPasswordSetup Page', () => {
  it('renders layout', () => {
    render(<BrowserRouter><RegisterPasswordSetup /></BrowserRouter>);
    // Wait for effect or check loading state
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });
});
