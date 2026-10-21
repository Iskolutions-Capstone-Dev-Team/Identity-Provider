import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForgotPasswordModal from '../ForgotPasswordModal';

function renderWithClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('ForgotPasswordModal Component', () => {
  it('renders without crashing', () => {
    const { container } = renderWithClient(<ForgotPasswordModal isOpen={true} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
