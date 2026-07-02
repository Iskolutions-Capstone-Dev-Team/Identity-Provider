import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ConnectedAppClientTable from '../ConnectedAppClientTable';
import { BrowserRouter } from 'react-router-dom';

describe('ConnectedAppClientTable Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><ConnectedAppClientTable clients={[]} /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
