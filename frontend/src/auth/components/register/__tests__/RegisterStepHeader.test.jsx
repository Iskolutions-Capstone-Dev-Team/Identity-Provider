import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegisterStepHeader from '../RegisterStepHeader';

describe('RegisterStepHeader Component', () => {
  it('renders details step header', () => {
    render(<RegisterStepHeader step="details" email="" />);
    expect(screen.getByText('Join')).toBeInTheDocument();
    expect(screen.getByText('PUPTian!')).toBeInTheDocument();
  });

  it('renders verifyEmail step header', () => {
    render(<RegisterStepHeader step="verifyEmail" email="test@example.com" />);
    expect(screen.getByText('Verify')).toBeInTheDocument();
    expect(screen.getByText(/tes\*\*@ex\*\*\*\*\*\.com/)).toBeInTheDocument();
  });

  it('renders setPassword step header', () => {
    render(<RegisterStepHeader step="setPassword" email="test@example.com" />);
    expect(screen.getByText('Set Your')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('returns null for success step', () => {
    const { container } = render(<RegisterStepHeader step="success" email="" />);
    expect(container.firstChild).toBeNull();
  });
});
