import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ForgotPasswordEmailStep from '../ForgotPasswordEmailStep';

describe('ForgotPasswordEmailStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ForgotPasswordEmailStep email="" setEmail={vi.fn()} onNext={vi.fn()} error="" isChecking={false} />);
    expect(container).toBeInTheDocument();
  });
});
