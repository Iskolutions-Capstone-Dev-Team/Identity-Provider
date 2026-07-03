import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ForgotPasswordModal from '../ForgotPasswordModal';

describe('ForgotPasswordModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ForgotPasswordModal isOpen={true} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
