import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginForm from '../LoginForm';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('LoginForm Component', () => {
  it('renders without crashing and displays inputs', () => {
    const { container } = render(
      <QueryClientProvider client={createTestQueryClient()}>
        <BrowserRouter>
          <LoginForm clientId="test-client-id" />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(container).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders initial error message when provided', () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <BrowserRouter>
          <LoginForm clientId="test-client-id" initialError="Too many requests. Please wait a moment and try again." />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Too many requests/i)).toBeInTheDocument();
  });
});
