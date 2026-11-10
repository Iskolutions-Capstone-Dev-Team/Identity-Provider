import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopLoginsPanel from '../TopLoginsPanel';

describe('TopLoginsPanel Component', () => {
  it('renders without crashing with empty data', () => {
    const { container } = render(<TopLoginsPanel clients={[]} periods={[]} />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/Top Logins/i)).toBeInTheDocument();
    expect(screen.getByText('No login activity')).toBeInTheDocument();
  });

  it('renders clients and green sparkline bars when client data is provided', () => {
    const mockClients = [
      {
        client_id: 'client-12345',
        client_name: 'PUP-Taguig Identity Provider',
        login_count: 42,
      },
    ];

    const mockPeriods = [
      { key: 'today', shortLabel: 'Today', count: 42 },
      { key: 'month', shortLabel: 'Month', count: 100 },
    ];

    const { container } = render(
      <TopLoginsPanel
        clients={mockClients}
        periods={mockPeriods}
        selectedPeriod={{ count: 42 }}
        selectedPeriodKey="today"
      />
    );

    expect(screen.getByText('PUP-Taguig Identity Provider')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Verify green sparkline SVG is present
    const sparklineSvg = container.querySelector('svg[aria-label="Login activity: 42 logins"]');
    expect(sparklineSvg).toBeInTheDocument();

    const rects = sparklineSvg.querySelectorAll('rect');
    expect(rects.length).toBe(10);
    // Verify rect has the emerald green fill classes
    expect(rects[0].getAttribute('class')).toContain('fill-emerald-500');
    expect(rects[0].getAttribute('class')).toContain('dark:fill-emerald-400');
  });
});
