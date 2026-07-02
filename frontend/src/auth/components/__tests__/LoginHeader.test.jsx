import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoginHeader from '../LoginHeader';
import { BrowserRouter } from 'react-router-dom';

describe('LoginHeader Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><LoginHeader /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
