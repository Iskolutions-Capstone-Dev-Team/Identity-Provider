import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AppClientIconBox from '../AppClientIconBox';

describe('AppClientIconBox Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AppClientIconBox name="Test" />);
    expect(container).toBeInTheDocument();
  });
});
