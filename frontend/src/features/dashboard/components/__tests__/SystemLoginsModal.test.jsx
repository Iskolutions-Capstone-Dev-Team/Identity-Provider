import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SystemLoginsModal from '../SystemLoginsModal';

describe('SystemLoginsModal Component', () => {
  it('renders without crashing', () => {
    const period = { topClients: [], shortLabel: 'Today' };
    const { container } = render(<SystemLoginsModal open={true} period={period} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
