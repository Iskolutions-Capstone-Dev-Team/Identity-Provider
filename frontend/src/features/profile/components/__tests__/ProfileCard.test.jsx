import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileCard from '../ProfileCard';

describe('ProfileCard Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProfileCard profile={{ email: 'test@test.com' }} />);
    expect(container).toBeInTheDocument();
  });
});
