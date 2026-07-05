import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AuthLoadingScreen from '../AuthLoadingScreen';

describe('AuthLoadingScreen Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuthLoadingScreen />);
    expect(container).toBeInTheDocument();
  });
});
