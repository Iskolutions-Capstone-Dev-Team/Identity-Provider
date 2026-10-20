import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoginForm from '../LoginForm';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('LoginForm Component', () => {
  it('renders without crashing', () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
