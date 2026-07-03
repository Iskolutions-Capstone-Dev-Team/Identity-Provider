import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import LoginMfaFlow from '../LoginMfaFlow';

import { BrowserRouter } from 'react-router-dom';

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

describe('LoginMfaFlow Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><LoginMfaFlow mfaToken="test" setMfaToken={vi.fn()} setRequiresMfa={vi.fn()} clientId="test" redirectUri="test" /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
