import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MultiSelect from '../MultiSelect';

describe('MultiSelect Component', () => {
  const options = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
  ];

  it('renders with placeholder when no items selected', () => {
    render(
      <MultiSelect 
        options={options} 
        selectedValues={[]} 
        onChange={() => {}} 
        placeholder="Select options" 
      />
    );
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  it('renders selected items as tags', () => {
    render(
      <MultiSelect 
        options={options} 
        selectedValues={['1', '2']} 
        onChange={() => {}} 
      />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
  });

  it('calls onChange when an option tag is removed', async () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect 
        options={options} 
        selectedValues={['1']} 
        onChange={handleChange} 
      />
    );
    
    const removeBtn = screen.getAllByRole('button', { name: 'x' })[0];
    await userEvent.click(removeBtn);
    
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
