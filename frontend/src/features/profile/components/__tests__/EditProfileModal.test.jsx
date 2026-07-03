import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditProfileModal from '../EditProfileModal';

describe('EditProfileModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<EditProfileModal isOpen={true} onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
