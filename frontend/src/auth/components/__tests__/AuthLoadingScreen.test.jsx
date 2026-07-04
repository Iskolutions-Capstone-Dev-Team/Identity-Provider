import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AuthLoadingScreen from '../AuthLoadingScreen';

describe('AuthLoadingScreen Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuthLoadingScreen />);
    expect(container).toBeInTheDocument();
  });

  it('renders a simple spinner when spinnerOnly is true', () => {
    const { container } = render(<AuthLoadingScreen spinnerOnly />);
    // Verify that the simple spinner class exists
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    // Verify that the full-screen ring loading does not exist
    expect(container.querySelector('.loading-ring')).not.toBeInTheDocument();
  });
});
