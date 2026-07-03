import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ModalSteps from '../ModalSteps';

describe('ModalSteps Component', () => {
  const steps = ['Step 1', 'Step 2', 'Step 3'];

  it('renders all steps', () => {
    render(<ModalSteps steps={steps} currentStep={1} />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('highlights the current and previous steps as primary', () => {
    render(<ModalSteps steps={steps} currentStep={2} />);
    
    const step1 = screen.getByText('Step 1');
    const step2 = screen.getByText('Step 2');
    const step3 = screen.getByText('Step 3');
    
    expect(step1).toHaveClass('step-primary');
    expect(step2).toHaveClass('step-primary');
    expect(step3).not.toHaveClass('step-primary');
  });
});
