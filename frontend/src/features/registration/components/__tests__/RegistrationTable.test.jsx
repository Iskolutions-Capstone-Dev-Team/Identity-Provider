import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RegistrationTable from '../RegistrationTable';

describe('RegistrationTable Component', () => {
  it('renders table headers', () => {
    // Stub
    render(<RegistrationTable configs={[]} isLoading={false} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
