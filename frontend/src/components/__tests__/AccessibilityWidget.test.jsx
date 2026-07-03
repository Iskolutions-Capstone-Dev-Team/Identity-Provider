import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AccessibilityWidget from '../AccessibilityWidget';

describe('AccessibilityWidget Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AccessibilityWidget />);
    expect(container).toBeInTheDocument();
  });
});
