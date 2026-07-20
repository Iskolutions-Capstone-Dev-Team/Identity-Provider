import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SecretConfirmModal from '../SecretConfirmModal';

describe('SecretConfirmModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<SecretConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
