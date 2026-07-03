import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterSuccessStep from '../RegisterSuccessStep';

describe('RegisterSuccessStep Component', () => {
  it('renders success content', () => {
    render(<BrowserRouter><RegisterSuccessStep loginPath="/login" /></BrowserRouter>);
    expect(screen.getByText('Account Ready')).toBeInTheDocument();
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
  });
});
