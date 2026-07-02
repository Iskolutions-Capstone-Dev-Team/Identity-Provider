import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ReportFilterSelect from '../ReportFilterSelect';

describe('ReportFilterSelect Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ReportFilterSelect selectedFilters={[]} onChange={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
