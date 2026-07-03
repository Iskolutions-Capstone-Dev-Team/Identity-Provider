import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock storage before anything else
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
import Logout from '../Logout';

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams()],
  useNavigate: () => vi.fn()
}));

vi.mock('../../services/authService', () => ({
  authService: {
    logout: vi.fn().mockResolvedValue({}),
    checkSession: vi.fn().mockResolvedValue({ user_id: '123' })
  }
}));

describe('Logout Page', () => {
  it('renders loading message', () => {
    render(<Logout />);
    expect(screen.getByText(/Signing you out/i)).toBeInTheDocument();
  });
});
