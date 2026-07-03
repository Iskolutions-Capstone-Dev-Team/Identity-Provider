import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RegistrationCreateForm from '../RegistrationCreateForm';

describe('RegistrationCreateForm Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<RegistrationCreateForm onSubmit={vi.fn()} onCancel={vi.fn()} isLoading={false} />);
    expect(container).toBeInTheDocument();
  });
});
