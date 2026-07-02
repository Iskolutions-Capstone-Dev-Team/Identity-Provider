import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UserPoolFilters from '../UserPoolFilters';

describe('UserPoolFilters Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<UserPoolFilters filters={{}} setFilters={() => {}} />);
    expect(container).toBeInTheDocument();
  });
});
