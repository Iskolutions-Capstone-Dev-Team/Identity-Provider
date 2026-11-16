import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RolesListTable from '../RolesListTable';
import { BrowserRouter } from 'react-router-dom';

describe('RolesListTable Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><RolesListTable roles={[]} onEdit={vi.fn()} onDelete={vi.fn()} /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });

  it('renders long descriptions with text wrapping classes to break long content', () => {
    const longDesc = 'this role is made for the admission system to change and manage applicants and turn them into students.';
    const mockRoles = [
      {
        id: 1,
        role_name: 'panel',
        description: longDesc,
        permissionLabels: ['Activate user', 'Add user'],
        canEdit: true,
        canDelete: true,
      },
    ];

    render(
      <BrowserRouter>
        <RolesListTable roles={mockRoles} onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
      </BrowserRouter>
    );

    const descElement = screen.getByText(longDesc);
    expect(descElement).toBeInTheDocument();
    expect(descElement).toHaveClass('break-words');
    expect(descElement).toHaveClass('whitespace-normal');
    expect(descElement.closest('td')).toHaveClass('whitespace-normal');
  });

  it('renders fallback when role description is empty', () => {
    const mockRoles = [
      {
        id: 2,
        role_name: 'guest',
        description: '',
        permissionLabels: [],
        canEdit: false,
        canDelete: false,
      },
    ];

    render(
      <BrowserRouter>
        <RolesListTable roles={mockRoles} onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText(/no description/i)).toBeInTheDocument();
  });
});
