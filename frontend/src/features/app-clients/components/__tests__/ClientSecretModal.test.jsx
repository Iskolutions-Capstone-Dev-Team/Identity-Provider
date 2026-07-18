import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ClientSecretModal from '../ClientSecretModal';

describe('ClientSecretModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ClientSecretModal isOpen={true} onClose={vi.fn()} clientSecret="test-secret" />);
    expect(container).toBeInTheDocument();
  });
});
