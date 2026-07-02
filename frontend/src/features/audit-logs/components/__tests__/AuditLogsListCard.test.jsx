import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AuditLogsListCard from '../AuditLogsListCard';

describe('AuditLogsListCard Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuditLogsListCard logs={[]} onViewDetails={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
