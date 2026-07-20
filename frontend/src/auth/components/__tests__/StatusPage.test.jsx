import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StatusPage from '../StatusPage';

describe('StatusPage Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<StatusPage title="Test" message="Test" />);
    expect(container).toBeInTheDocument();
  });
});
