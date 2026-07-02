import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MfaSetupConfirm from '../MfaSetupConfirm';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('MfaSetupConfirm Page', () => {
  it('renders confirmation view', () => {
    render(<BrowserRouter><MfaSetupConfirm /></BrowserRouter>);
    // Basic verification
    expect(screen.getByText(/Enter the code/i)).toBeInTheDocument();
  });
});
