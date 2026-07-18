import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RegistrationListCard from '../RegistrationListCard';

describe('RegistrationListCard Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<RegistrationListCard onSelect={vi.fn()} config={{}} />);
    expect(container).toBeInTheDocument();
  });
});
