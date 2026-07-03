import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import FAQTopicButton from '../FAQTopicButton';

describe('FAQTopicButton Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<FAQTopicButton title="Test" active={false} onClick={vi.fn()} theme={{ activeTopic: '', inactiveTopic: '' }} topic={{ iconPath: '', questions: [] }} />);
    expect(container).toBeInTheDocument();
  });
});
