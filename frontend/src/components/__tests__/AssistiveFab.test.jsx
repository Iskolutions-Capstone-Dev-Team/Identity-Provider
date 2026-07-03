import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AssistiveFab from '../AssistiveFab';

// Mock the nested components and utilities
vi.mock('../AccessibilityWidget', () => ({
  isAccessibilityWidgetReady: () => true,
  toggleAccessibilityMenu: vi.fn(),
  ACCESSIBILITY_READY_EVENT: 'accessibilityReady',
  ACCESSIBILITY_UNAVAILABLE_EVENT: 'accessibilityUnavailable'
}));

vi.mock('../OnePortalButton', () => ({
  __esModule: true,
  default: () => <button aria-label="One Portal">Mock OnePortal</button>
}));

vi.mock('../SpeechInputButton', () => ({
  FloatingSpeechInputAction: () => <button aria-label="Voice Input">Mock Speech</button>
}));

describe('AssistiveFab Component', () => {
  it('renders the main toggle button', () => {
    render(
      <MemoryRouter>
        <AssistiveFab />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('button', { name: /Open assistive tools/i })).toBeInTheDocument();
  });

  it('opens the fab menu when toggle is clicked', async () => {
    render(
      <MemoryRouter>
        <AssistiveFab />
      </MemoryRouter>
    );
    
    const toggleBtn = screen.getByRole('button', { name: /Open assistive tools/i });
    await userEvent.click(toggleBtn);
    
    expect(screen.getByRole('button', { name: /Close assistive tools/i })).toBeInTheDocument();
    
    // The tools should now be in the DOM
    expect(screen.getByRole('button', { name: 'One Portal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voice Input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open web accessibility/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open FAQ/i })).toBeInTheDocument();
  });
});
