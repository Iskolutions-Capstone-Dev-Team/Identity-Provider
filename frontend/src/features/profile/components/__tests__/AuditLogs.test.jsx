import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuditLogs from '../AuditLogs';

vi.mock('../../../../services/logService', () => ({
  logService: {
    getUserLogs: vi.fn().mockResolvedValue({ data: [] })
  }
}));

describe('AuditLogs Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuditLogs logs={[]} />);
    expect(container).toBeInTheDocument();
  });
});
