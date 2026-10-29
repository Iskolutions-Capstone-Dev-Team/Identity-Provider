import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AuthenticatorsPanel from '../AuthenticatorsPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../../services/mfaService', () => ({
  mfaService: {
    getAuthenticators: vi.fn().mockResolvedValue([])
  }
}));

describe('AuthenticatorsPanel Component', () => {
  it('renders without crashing', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AuthenticatorsPanel />
      </QueryClientProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
