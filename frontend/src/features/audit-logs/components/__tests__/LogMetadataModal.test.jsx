import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import LogMetadataModal from '../LogMetadataModal';

describe('LogMetadataModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<LogMetadataModal isOpen={true} onClose={vi.fn()} log={{ metadata: {} }} />);
    expect(container).toBeInTheDocument();
  });
});
