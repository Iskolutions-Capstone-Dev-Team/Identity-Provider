import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Callback from '../Callback';

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams({ code: 'test_code' })],
  useNavigate: () => vi.fn()
}));

vi.mock('../../services/authService', () => ({
  authService: {
    completeAuthorization: vi.fn().mockResolvedValue({})
  }
}));

describe('Callback Page', () => {
  it('renders loading message', () => {
    render(<Callback />);
    expect(screen.getByText(/Signing You In/i)).toBeInTheDocument();
  });
});
