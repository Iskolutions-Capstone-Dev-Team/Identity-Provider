import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../Login';

global.sessionStorage = {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn()
};
global.localStorage = {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn()
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams({ client_id: 'test' })],
    useNavigate: () => vi.fn(),
    Navigate: () => <div data-testid="navigate">Redirecting...</div>
  };
});

vi.mock('../../services/authService', () => ({
  authService: {
    checkSession: vi.fn().mockResolvedValue({ authenticated: false })
  }
}));

describe('Login Page', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });
  });

  it('renders login form or loading screen', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Preparing Sign-In/i)).toBeInTheDocument();
  });
});
