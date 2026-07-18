import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MfaBackupCodeStep from '../MfaBackupCodeStep';

describe('MfaBackupCodeStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaBackupCodeStep code="" setCode={vi.fn()} onVerify={vi.fn()} onUseAuthenticator={vi.fn()} onCancel={vi.fn()} error="" isVerifying={false} />);
    expect(container).toBeInTheDocument();
  });
});
