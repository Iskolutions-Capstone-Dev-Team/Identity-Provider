import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RegisterPasswordSetupForm from '../RegisterPasswordSetupForm';
import { BrowserRouter } from 'react-router-dom';

describe('RegisterPasswordSetupForm Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><RegisterPasswordSetupForm onSuccess={vi.fn()} token="test" /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
