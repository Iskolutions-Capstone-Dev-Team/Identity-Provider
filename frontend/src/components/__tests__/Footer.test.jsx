import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders the PUP IDP branding correctly', () => {
    render(<Footer />);
    
    // Check for logo and main text
    expect(screen.getByAltText('PUP IDP Logo')).toBeInTheDocument();
    expect(screen.getByText('PUPT IDP 2025')).toBeInTheDocument();
    expect(screen.getByText('Identity Provider System')).toBeInTheDocument();
  });

  it('renders the Stay Connected section with social links', () => {
    render(<Footer />);
    
    expect(screen.getByText('Stay Connected')).toBeInTheDocument();
    
    // Since the SVGs don't have aria-labels in the component, we can check by href
    const links = screen.getAllByRole('link');
    const fbLink = links.find(link => link.href.includes('facebook.com'));
    const ytLink = links.find(link => link.href.includes('youtube.com'));
    
    expect(fbLink).toBeInTheDocument();
    expect(ytLink).toBeInTheDocument();
  });

  it('renders the bottom legal links', () => {
    render(<Footer />);
    
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });
});
