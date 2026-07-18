import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MfaSetupQrStep from '../MfaSetupQrStep';

describe('MfaSetupQrStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaSetupQrStep setupData={{ qrCodeUrl: 'test', secret: 'test' }} onNext={vi.fn()} onCancel={vi.fn()} isGenerating={false} error="" />);
    expect(container).toBeInTheDocument();
  });
});
