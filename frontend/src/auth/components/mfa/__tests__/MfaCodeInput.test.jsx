import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MfaCodeInput from '../MfaCodeInput';

describe('MfaCodeInput Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaCodeInput value={['', '', '', '', '', '']} onChange={vi.fn()} onComplete={vi.fn()} error={false} disabled={false} />);
    expect(container).toBeInTheDocument();
  });
});
