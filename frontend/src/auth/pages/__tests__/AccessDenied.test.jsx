import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AccessDenied from '../AccessDenied';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('AccessDenied Page', () => {
  it('renders default access denied message', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AccessDenied />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(/You do not have access to this service/i)).toBeInTheDocument();
  });

  it('renders suspended account notice when reason is suspended', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/access-denied?reason=suspended']}>
          <AccessDenied />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Account Suspended/i)).toBeInTheDocument();
    expect(screen.getByText(/Suspicious location activity/i)).toBeInTheDocument();
  });
});
