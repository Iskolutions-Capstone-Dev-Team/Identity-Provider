import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthorizeRedirect from '../AuthorizeRedirect';

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

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams({ client_id: 'test_client', redirect_uri: 'http://test' })],
  useNavigate: () => vi.fn(),
  Navigate: () => <div data-testid="navigate">Redirecting...</div>
}));

vi.mock('../../utils/authCookies', () => ({
  hasPendingMfaTokenResponse: vi.fn(() => false),
  getAccessToken: vi.fn(() => null)
}));

describe('AuthorizeRedirect Page', () => {
  it('renders auth loading screen initially', () => {
    render(<AuthorizeRedirect />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
