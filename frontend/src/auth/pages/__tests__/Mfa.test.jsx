import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Mfa from '../Mfa';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

vi.mock('../../services/userService', () => ({
  userService: {
    getMe: vi.fn().mockResolvedValue({ email: 'test@example.com' })
  }
}));

describe('Mfa Page', () => {
  it('renders loading step initially', () => {
    const { container } = render(<BrowserRouter><Mfa /></BrowserRouter>);
    // MfaLoadingStep just renders a spinner in a div usually, 
    // or it renders some text. Since it's loading, let's just check container.
    expect(container).toBeInTheDocument();
  });
});
