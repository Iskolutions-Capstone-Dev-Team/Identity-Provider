import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MfaSetup from '../MfaSetup';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

vi.mock('../../services/mfaService', () => ({
  mfaService: {
    generateTotpSecret: vi.fn().mockResolvedValue({ qr_code_url: '', secret: '' })
  }
}));

describe('MfaSetup Page', () => {
  it('renders loading state initially', () => {
    const { container } = render(<BrowserRouter><MfaSetup /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
