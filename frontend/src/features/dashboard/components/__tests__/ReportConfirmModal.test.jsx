import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ReportConfirmModal from '../ReportConfirmModal';

describe('ReportConfirmModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ReportConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
