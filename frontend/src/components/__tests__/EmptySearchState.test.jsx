import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptySearchState from '../EmptySearchState';

describe('EmptySearchState Component', () => {
  it('renders the message correctly', () => {
    render(<EmptySearchState message="No results found" />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});
