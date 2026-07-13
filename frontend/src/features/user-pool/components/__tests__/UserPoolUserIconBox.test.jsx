import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UserPoolUserIconBox from '../UserPoolUserIconBox';

describe('UserPoolUserIconBox Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<UserPoolUserIconBox name="Test" email="test@test.com" />);
    expect(container).toBeInTheDocument();
  });
});
