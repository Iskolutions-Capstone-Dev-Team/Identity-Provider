import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RegisterForm from '../RegisterForm';
import { BrowserRouter } from 'react-router-dom';

describe('RegisterForm Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><RegisterForm onSuccess={vi.fn()} /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
