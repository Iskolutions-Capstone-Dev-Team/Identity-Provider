import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpeechInputButton from '../SpeechInputButton';

describe('SpeechInputButton Component', () => {
  let mockSpeechRecognition;
  
  beforeEach(() => {
    mockSpeechRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
    };
    
    window.SpeechRecognition = vi.fn().mockImplementation(function() {
      return mockSpeechRecognition;
    });
  });

  it('renders the microphone button if SpeechRecognition is supported', () => {
    render(<SpeechInputButton />);
    expect(screen.getByRole('button', { name: /Use voice input/i })).toBeInTheDocument();
  });

  it('does not render if SpeechRecognition is unsupported', () => {
    delete window.SpeechRecognition;
    const { container } = render(<SpeechInputButton />);
    expect(container.firstChild).toBeNull();
  });

  it('starts recognition when clicked', async () => {
    render(<SpeechInputButton />);
    
    const btn = screen.getByRole('button', { name: /Use voice input/i });
    await userEvent.click(btn);
    
    expect(window.SpeechRecognition).toHaveBeenCalled();
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });

  it('does not start recognition if disabled', async () => {
    render(<SpeechInputButton disabled={true} />);
    
    const btn = screen.getByRole('button', { name: /Use voice input/i });
    expect(btn).toBeDisabled();
    
    await userEvent.click(btn);
    expect(mockSpeechRecognition.start).not.toHaveBeenCalled();
  });
});
