import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import TagMultiSelect from '../TagMultiSelect';

describe('TagMultiSelect Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<TagMultiSelect options={[]} selectedValues={[]} onChange={vi.fn()} label="Test" />);
    expect(container).toBeInTheDocument();
  });
});
