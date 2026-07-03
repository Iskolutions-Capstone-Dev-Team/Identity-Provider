import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams({ client_id: 'test' })],
    Navigate: () => <div data-testid="navigate">Redirecting...</div>
  };
});

describe('Register Page', () => {
  it('renders register form within layout', () => {
    render(<BrowserRouter><Register /></BrowserRouter>);
    // AuthLayout has the Welcome PUPTian text
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });
});
