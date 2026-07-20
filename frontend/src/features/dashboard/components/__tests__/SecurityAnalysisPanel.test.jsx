import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SecurityAnalysisPanel from '../SecurityAnalysisPanel';

describe('SecurityAnalysisPanel Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<SecurityAnalysisPanel metrics={{ activeTokens: 0 }} />);
    expect(container).toBeInTheDocument();
  });
});
