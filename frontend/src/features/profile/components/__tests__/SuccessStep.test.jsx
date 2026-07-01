import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuccessStep from '../SuccessStep';

describe('SuccessStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<SuccessStep title="Success" message="Done" onFinish={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
