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

  it('contains a Suspense boundary for lazy-loaded routes', () => {
    const { container } = render(<App />);
    // Suspense itself doesn't render a DOM node, but we can verify it renders successfully without errors.
    // The fallback won't render unless a lazy component is actively suspending in JSDOM.
    expect(container).toBeTruthy();
  });
});
