import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import FAQPanel from '../FAQPanel';

describe('FAQPanel Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<FAQPanel onClose={vi.fn()} theme={{ panel: '', panelHover: '' }} />);
    expect(container).toBeInTheDocument();
  });
});
