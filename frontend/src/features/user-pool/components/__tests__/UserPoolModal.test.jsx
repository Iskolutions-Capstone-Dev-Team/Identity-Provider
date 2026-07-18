import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import UserPoolModal from '../UserPoolModal';

describe('UserPoolModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<UserPoolModal isOpen={true} onClose={vi.fn()} onSaved={vi.fn()} user={{}} />);
    expect(container).toBeInTheDocument();
  });
});
