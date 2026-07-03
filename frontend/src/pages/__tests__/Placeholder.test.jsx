import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Placeholder from '../Placeholder';

describe('Placeholder Page', () => {
  it('renders the placeholder correctly', () => {
    render(<BrowserRouter><Placeholder /></BrowserRouter>);
    expect(screen.getByText('Sorry, currently working on this page.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return' })).toBeInTheDocument();
  });
});
