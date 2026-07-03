import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
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

describe('ProtectedRoute Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><ProtectedRoute><div>Test</div></ProtectedRoute></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
