import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ErrorPage from '../ErrorPage';

vi.mock('../../utils/idpErrorPage', () => ({
  getIdpErrorMessage: vi.fn(() => 'Oops! Something went wrong'),
  getIdpErrorReturnPath: vi.fn(),
  clearIdpErrorMessage: vi.fn(),
  clearIdpErrorReturnPath: vi.fn(),
}));

describe('ErrorPage Component', () => {
  it('renders error content', () => {
    render(<BrowserRouter><ErrorPage /></BrowserRouter>);
    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
  });
});
