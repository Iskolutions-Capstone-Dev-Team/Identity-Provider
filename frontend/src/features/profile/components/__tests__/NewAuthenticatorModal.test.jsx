import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewAuthenticatorModal from '../NewAuthenticatorModal';

describe('NewAuthenticatorModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<NewAuthenticatorModal isOpen={true} onClose={vi.fn()} onAdded={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
