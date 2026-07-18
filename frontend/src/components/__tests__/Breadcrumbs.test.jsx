import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs';

describe('Breadcrumbs Component', () => {
  // We need to setup a portal target for the component to render into
  beforeEach(() => {
    const portalDiv = document.createElement('div');
    portalDiv.id = 'navbar-breadcrumbs';
    document.body.appendChild(portalDiv);
  });

  afterEach(() => {
    const portalDiv = document.getElementById('navbar-breadcrumbs');
    if (portalDiv) {
      document.body.removeChild(portalDiv);
    }
  });

  it('renders nothing if portal target is missing', () => {
    document.body.innerHTML = ''; // Remove the target
    const { container } = render(
      <MemoryRouter>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }]} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the breadcrumbs correctly', () => {
    const items = [
      { label: 'Home', to: '/' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Current Page' }
    ];

    render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>
    );
    
    // Links should be present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');

    // Current page shouldn't be a link
    expect(screen.getByText('Current Page')).toBeInTheDocument();
    expect(screen.getByText('Current Page').closest('a')).toBeNull();
  });
});
