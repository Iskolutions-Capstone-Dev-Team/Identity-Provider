import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TopLoginsPanel from '../TopLoginsPanel';

describe('TopLoginsPanel Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<TopLoginsPanel clients={[]} periods={[]} />);
    expect(container).toBeInTheDocument();
  });
});
