import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MfaLoadingStep from '../MfaLoadingStep';

describe('MfaLoadingStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaLoadingStep />);
    expect(container).toBeInTheDocument();
  });
});
