import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InputEmailStep from '../InputEmailStep';

describe('InputEmailStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<InputEmailStep onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
