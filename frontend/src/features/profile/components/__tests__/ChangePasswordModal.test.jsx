import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChangePasswordModal from '../ChangePasswordModal';

describe('ChangePasswordModal Component', () => {
  it('renders without crashing when open', () => {
    const { container } = render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
