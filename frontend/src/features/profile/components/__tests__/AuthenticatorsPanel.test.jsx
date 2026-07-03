import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthenticatorsPanel from '../AuthenticatorsPanel';

vi.mock('../../../../services/mfaService', () => ({
  mfaService: {
    getAuthenticators: vi.fn().mockResolvedValue([])
  }
}));

describe('AuthenticatorsPanel Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuthenticatorsPanel />);
    expect(container).toBeInTheDocument();
  });
});
