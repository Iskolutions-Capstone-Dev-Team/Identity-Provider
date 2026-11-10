import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import LoginMfaFlow from '../LoginMfaFlow';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

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

describe('LoginMfaFlow Component', () => {
  it('renders without crashing', () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginMfaFlow mfaToken="test" setMfaToken={vi.fn()} setRequiresMfa={vi.fn()} clientId="test" redirectUri="test" />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
