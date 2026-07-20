import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RegistrationSyncConfirmModal from '../RegistrationSyncConfirmModal';

describe('RegistrationSyncConfirmModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<RegistrationSyncConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} isSyncing={false} />);
    expect(container).toBeInTheDocument();
  });
});
