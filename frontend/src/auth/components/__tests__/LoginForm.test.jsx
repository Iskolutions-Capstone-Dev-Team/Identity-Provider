import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoginForm from '../LoginForm';
import { BrowserRouter } from 'react-router-dom';

describe('LoginForm Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><LoginForm /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
