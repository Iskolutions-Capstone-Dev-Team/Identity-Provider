import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FAQSkeleton from '../FAQSkeleton';

describe('FAQSkeleton Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<FAQSkeleton />);
    expect(container).toBeInTheDocument();
  });
});
