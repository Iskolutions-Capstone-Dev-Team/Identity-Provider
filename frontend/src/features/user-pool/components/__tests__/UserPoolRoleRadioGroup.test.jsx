import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import UserPoolRoleRadioGroup from '../UserPoolRoleRadioGroup';

describe('UserPoolRoleRadioGroup Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<UserPoolRoleRadioGroup selectedRole="" onChange={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
