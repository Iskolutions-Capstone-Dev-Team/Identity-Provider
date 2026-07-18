import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RoleModal from '../RoleModal';

describe('RoleModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<RoleModal isOpen={true} onClose={vi.fn()} onSaved={vi.fn()} role={{}} availablePermissions={[]} />);
    expect(container).toBeInTheDocument();
  });
});
