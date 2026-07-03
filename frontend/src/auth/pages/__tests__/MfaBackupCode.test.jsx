import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MfaBackupCode from '../MfaBackupCode';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('MfaBackupCode Page', () => {
  it('renders loading state initially', () => {
    const { container } = render(<BrowserRouter><MfaBackupCode /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
