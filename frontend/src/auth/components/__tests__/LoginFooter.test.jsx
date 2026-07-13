import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoginFooter from '../LoginFooter';
import { BrowserRouter } from 'react-router-dom';

describe('LoginFooter Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><LoginFooter /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
