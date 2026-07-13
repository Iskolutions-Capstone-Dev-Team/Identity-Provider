import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AppClientCreateForm from '../AppClientCreateForm';

describe('AppClientCreateForm Component', () => {
  it('renders form fields', () => {
    render(<AppClientCreateForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });
});
