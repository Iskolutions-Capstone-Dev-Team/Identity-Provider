import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileDetails from '../ProfileDetails';

describe('ProfileDetails Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProfileDetails profile={{}} />);
    expect(container).toBeInTheDocument();
  });
});
