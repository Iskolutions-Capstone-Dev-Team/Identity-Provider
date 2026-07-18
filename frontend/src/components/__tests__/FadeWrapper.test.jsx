import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FadeWrapper from '../FadeWrapper';

// Mock matchMedia for framer-motion useReducedMotion
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

describe('FadeWrapper Component', () => {
  it('renders children when isVisible is true', () => {
    render(
      <FadeWrapper isVisible={true} keyId="test">
        <div>Faded Content</div>
      </FadeWrapper>
    );
    expect(screen.getByText('Faded Content')).toBeInTheDocument();
  });

  it('does not render children when isVisible is false', () => {
    const { container } = render(
      <FadeWrapper isVisible={false} keyId="test">
        <div>Faded Content</div>
      </FadeWrapper>
    );
    expect(screen.queryByText('Faded Content')).not.toBeInTheDocument();
  });
});
