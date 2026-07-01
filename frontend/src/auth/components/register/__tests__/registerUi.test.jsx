import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  FieldError,
  FormLabel,
  RegisterSubmitButton,
  RegisterTextField,
  RegisterPasswordField,
  RoleSelectField
} from '../registerUi';

describe('registerUi Components', () => {
  it('renders FieldError when message is provided', () => {
    render(<FieldError message="Error text" />);
    expect(screen.getByText('Error text')).toBeInTheDocument();
  });

  it('renders nothing when FieldError has no message', () => {
    const { container } = render(<FieldError />);
    expect(container.firstChild).toBeNull();
  });

  it('renders FormLabel', () => {
    render(<FormLabel required>TestLabel</FormLabel>);
    expect(screen.getByText(/TestLabel/)).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders RegisterSubmitButton', () => {
    render(<RegisterSubmitButton disabled={false}>TestSubmit</RegisterSubmitButton>);
    expect(screen.getByRole('button', { name: /TestSubmit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /TestSubmit/i })).not.toBeDisabled();
  });

  it('renders RegisterTextField', () => {
    const onChange = vi.fn();
    render(<RegisterTextField label="Text Field" type="text" value="test" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test');
    fireEvent.change(input, { target: { value: 'test2' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders RegisterPasswordField', () => {
    const onChange = vi.fn();
    const onToggle = vi.fn();
    render(<RegisterPasswordField label="Password Field" value="pass" isVisible={false} onChange={onChange} onToggle={onToggle} />);
    const input = screen.getByDisplayValue('pass');
    expect(input).toHaveAttribute('type', 'password');
    const toggleBtn = screen.getByRole('button');
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalled();
  });

  it('renders RoleSelectField', () => {
    const onToggle = vi.fn();
    const onSelect = vi.fn();
    const options = [{ id: 'student', label: 'Student', Icon: () => <span>S</span> }];
    render(<RoleSelectField isOpen={true} options={options} value="" onToggle={onToggle} onSelect={onSelect} />);
    
    // There are two buttons now, one for toggle and one for option
    const toggleButton = screen.getAllByRole('button')[0];
    fireEvent.click(toggleButton);
    expect(onToggle).toHaveBeenCalled();
    
    const studentOption = screen.getByText('Student');
    fireEvent.click(studentOption);
    expect(onSelect).toHaveBeenCalledWith('student');
  });
});
