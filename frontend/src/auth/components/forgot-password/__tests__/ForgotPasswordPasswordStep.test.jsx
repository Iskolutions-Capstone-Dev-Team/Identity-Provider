import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ForgotPasswordPasswordStep from '../ForgotPasswordPasswordStep';

describe('ForgotPasswordPasswordStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ForgotPasswordPasswordStep form={{ newPassword: '', confirmPassword: '' }} validation={{ checks: {} }} setForm={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} error="" isResetting={false} />);
    expect(container).toBeInTheDocument();
  });
});
