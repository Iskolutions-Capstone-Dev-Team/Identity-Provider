import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MfaSetupConfirmStep from '../MfaSetupConfirmStep';

describe('MfaSetupConfirmStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaSetupConfirmStep code={['', '', '', '', '', '']} backupCodes={[]} setCode={vi.fn()} onVerify={vi.fn()} onBack={vi.fn()} error="" isVerifying={false} />);
    expect(container).toBeInTheDocument();
  });
});
