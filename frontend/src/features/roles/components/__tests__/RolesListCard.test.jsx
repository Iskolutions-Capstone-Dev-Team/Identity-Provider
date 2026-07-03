import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RolesListCard from '../RolesListCard';

describe('RolesListCard Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<RolesListCard roles={[]} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
