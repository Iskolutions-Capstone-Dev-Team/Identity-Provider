import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ForgotPasswordSuccessStep from '../ForgotPasswordSuccessStep';

describe('ForgotPasswordSuccessStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ForgotPasswordSuccessStep onFinish={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
