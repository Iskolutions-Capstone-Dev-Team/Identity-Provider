import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MfaAuthenticatorCodeStep from '../MfaAuthenticatorCodeStep';

describe('MfaAuthenticatorCodeStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaAuthenticatorCodeStep code={['', '', '', '', '', '']} setCode={vi.fn()} onVerify={vi.fn()} onUseBackup={vi.fn()} onCancel={vi.fn()} error="" isVerifying={false} />);
    expect(container).toBeInTheDocument();
  });
});
