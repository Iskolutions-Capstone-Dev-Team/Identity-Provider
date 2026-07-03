import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AccessDenied from '../AccessDenied';

describe('AccessDenied Page', () => {
  it('renders access denied message', () => {
    render(<BrowserRouter><AccessDenied /></BrowserRouter>);
    expect(screen.getByText(/You do not have access to this service/i)).toBeInTheDocument();
  });
});
