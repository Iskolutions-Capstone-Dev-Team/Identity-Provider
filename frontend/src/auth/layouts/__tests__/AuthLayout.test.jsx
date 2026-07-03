import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthLayout from '../AuthLayout';

// Mock the accessibility widget to prevent side effects
vi.mock('../../components/AccessibilityWidget', () => ({
  clearAccessibilityWidget: vi.fn()
}));

// Mock child components
vi.mock('../../components/LoginHeader', () => ({
  default: () => <div data-testid="login-header">Header</div>
}));

vi.mock('../../components/LoginFooter', () => ({
  default: () => <div data-testid="login-footer">Footer</div>
}));

describe('AuthLayout Component', () => {
  it('renders children and layout components', () => {
    render(
      <BrowserRouter>
        <AuthLayout>
          <div data-testid="child-element">Auth Content</div>
        </AuthLayout>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('login-header')).toBeInTheDocument();
    expect(screen.getAllByTestId('login-footer').length).toBeGreaterThan(0);
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });
});
