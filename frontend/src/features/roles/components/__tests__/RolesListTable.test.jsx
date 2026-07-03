import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RolesListTable from '../RolesListTable';
import { BrowserRouter } from 'react-router-dom';

describe('RolesListTable Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><RolesListTable roles={[]} onEdit={vi.fn()} onDelete={vi.fn()} /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
