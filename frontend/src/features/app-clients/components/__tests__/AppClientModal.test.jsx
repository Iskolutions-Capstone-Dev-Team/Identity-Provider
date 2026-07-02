import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AppClientModal from '../AppClientModal';

describe('AppClientModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AppClientModal isOpen={true} onClose={vi.fn()} onSaved={vi.fn()} client={{}} />);
    expect(container).toBeInTheDocument();
  });
});
