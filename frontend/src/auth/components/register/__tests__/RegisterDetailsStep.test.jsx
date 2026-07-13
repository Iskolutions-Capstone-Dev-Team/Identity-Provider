import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterDetailsStep from '../RegisterDetailsStep';

describe('RegisterDetailsStep Component', () => {
  const defaultProps = {
    details: { firstName: '', middleName: '', suffix: '', lastName: '', email: '', accountType: '' },
    errors: {},
    isRoleMenuOpen: false,
    isSubmitting: false,
    loginPath: '/login',
    roleDropdownRef: { current: null },
    onBlur: vi.fn(),
    onChange: vi.fn(),
    onRoleMenuToggle: vi.fn(),
    onRoleSelect: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault())
  };

  it('renders input fields', () => {
    render(<BrowserRouter><RegisterDetailsStep {...defaultProps} /></BrowserRouter>);
    expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<BrowserRouter><RegisterDetailsStep {...defaultProps} /></BrowserRouter>);
    const firstNameInput = screen.getByPlaceholderText('Enter your first name');
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('firstName', 'John');
  });

  it('submits form', () => {
    render(<BrowserRouter><RegisterDetailsStep {...defaultProps} /></BrowserRouter>);
    fireEvent.submit(screen.getByRole('button', { name: /CONTINUE/i }));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });
});
