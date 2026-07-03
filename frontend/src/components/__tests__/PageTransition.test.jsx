import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PageTransition from '../PageTransition';

window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('PageTransition Component', () => {
  it('renders children with transition', () => {
    render(
      <PageTransition pageKey="page-1">
        <div>Page Content</div>
      </PageTransition>
    );
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});
