import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import UserPoolModalSelect from '../UserPoolModalSelect';

describe('UserPoolModalSelect Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<UserPoolModalSelect options={[]} value="" onChange={vi.fn()} placeholder="Select" label="Select" />);
    expect(container).toBeInTheDocument();
  });
});
