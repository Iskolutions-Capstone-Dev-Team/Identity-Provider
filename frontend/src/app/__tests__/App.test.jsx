import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
    writable: true,
  });
});

describe('app/App Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
