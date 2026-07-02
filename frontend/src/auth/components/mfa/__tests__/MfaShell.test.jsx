import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MfaShell from '../MfaShell';

describe('MfaShell Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaShell><div>Child</div></MfaShell>);
    expect(container).toBeInTheDocument();
  });
});
