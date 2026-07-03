import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RegistrationConfigModal from '../RegistrationConfigModal';

describe('RegistrationConfigModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<RegistrationConfigModal isOpen={true} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
