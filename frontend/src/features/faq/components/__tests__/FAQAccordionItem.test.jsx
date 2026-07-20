import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FAQAccordionItem from '../FAQAccordionItem';

describe('FAQAccordionItem', () => {
  const mockItem = {
    id: 'q1',
    question: 'How do I login?',
    answer: ['Step 1: Click login', 'Step 2: Enter credentials']
  };

  const mockTheme = {
    question: 'bg-white',
    questionOpen: 'border-blue',
    chevronButton: 'text-blue',
    divider: 'border-gray',
    answer: 'text-gray'
  };

  it('renders question text', () => {
    render(
      <FAQAccordionItem 
        item={mockItem} 
        isOpen={false} 
        onToggle={() => {}} 
        theme={mockTheme} 
      />
    );
    
    expect(screen.getByText('How do I login?')).toBeInTheDocument();
  });

  it('calls onToggle when button is clicked', () => {
    const onToggle = vi.fn();
    render(
      <FAQAccordionItem 
        item={mockItem} 
        isOpen={false} 
        onToggle={onToggle} 
        theme={mockTheme} 
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders answer when isOpen is true', () => {
    render(
      <FAQAccordionItem 
        item={mockItem} 
        isOpen={true} 
        onToggle={() => {}} 
        theme={mockTheme} 
      />
    );
    
    expect(screen.getByText('Step 1: Click login')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Enter credentials')).toBeInTheDocument();
  });

  it('does not render answer when isOpen is false', () => {
    render(
      <FAQAccordionItem 
        item={mockItem} 
        isOpen={false} 
        onToggle={() => {}} 
        theme={mockTheme} 
      />
    );
    
    expect(screen.queryByText('Step 1: Click login')).not.toBeInTheDocument();
  });
});
