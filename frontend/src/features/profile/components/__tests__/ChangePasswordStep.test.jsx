import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChangePasswordStep from '../ChangePasswordStep';

describe('ChangePasswordStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChangePasswordStep form={{}} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
