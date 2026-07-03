import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionButtons from '../ActionButtons';

describe('ActionButtons Component', () => {
  it('renders buttons and handles clicks', () => {
    const openEdit = vi.fn();
    const openPassword = vi.fn();
    
    render(<ActionButtons openEdit={openEdit} openPassword={openPassword} />);
    
    // Attempt to click Edit Profile
    const editBtn = screen.getByText(/Edit/i);
    fireEvent.click(editBtn);
    expect(openEdit).toHaveBeenCalled();
  });
});
