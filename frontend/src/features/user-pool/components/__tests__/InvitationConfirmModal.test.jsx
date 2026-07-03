import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import InvitationConfirmModal from '../InvitationConfirmModal';

describe('InvitationConfirmModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<InvitationConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} user={{}} />);
    expect(container).toBeInTheDocument();
  });
});
