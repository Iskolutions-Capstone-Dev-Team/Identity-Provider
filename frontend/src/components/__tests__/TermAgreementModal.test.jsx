import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import TermAgreementModal from '../TermAgreementModal';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock utilities
vi.mock('../../auth/utils/logoutRoute', () => ({
  buildLogoutPath: vi.fn(() => '/logout')
}));

vi.mock('../modalTransition', () => ({
  useModalTransition: vi.fn(() => ({ shouldRender: true, isClosing: false })),
  getModalTransitionClassName: vi.fn((base) => base)
}));

describe('TermAgreementModal Component', () => {
  let portalRoot;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal and its title', () => {
    render(
      <MemoryRouter>
        <TermAgreementModal open={true} />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Terms and Conditions' })).toBeInTheDocument();
  });

  it('enables continue button when checkbox is checked', async () => {
    const handleContinue = vi.fn();
    render(
      <MemoryRouter>
        <TermAgreementModal open={true} onContinue={handleContinue} />
      </MemoryRouter>
    );
    
    const continueBtn = screen.getByRole('button', { name: /Accept|Continue/i });
    expect(continueBtn).toBeDisabled();
    
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    
    expect(continueBtn).toBeEnabled();
    
    await userEvent.click(continueBtn);
    expect(handleContinue).toHaveBeenCalled();
  });

  it('navigates to logout when cancelled', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <TermAgreementModal open={true} onClose={handleClose} />
      </MemoryRouter>
    );
    
    const cancelBtn = screen.getByRole('button', { name: /Decline|Cancel/i });
    await userEvent.click(cancelBtn);
    
    expect(handleClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/logout', { replace: true });
  });
});
