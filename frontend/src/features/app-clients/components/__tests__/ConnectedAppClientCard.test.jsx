import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ConnectedAppClientCard from '../ConnectedAppClientCard';
import { BrowserRouter } from 'react-router-dom';

describe('ConnectedAppClientCard Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><ConnectedAppClientCard clients={[]} /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
