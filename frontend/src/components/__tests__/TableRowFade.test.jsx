import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TableRowFade from '../TableRowFade';

window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('TableRowFade Component', () => {
  it('renders a table row with children when isVisible is true', () => {
    render(
      <table>
        <tbody>
          <TableRowFade isVisible={true} keyId="row-1">
            <td>Row Data</td>
          </TableRowFade>
        </tbody>
      </table>
    );
    expect(screen.getByText('Row Data')).toBeInTheDocument();
    expect(screen.getByRole('row')).toBeInTheDocument();
  });

  it('does not render the row when isVisible is false', () => {
    render(
      <table>
        <tbody>
          <TableRowFade isVisible={false} keyId="row-1">
            <td>Row Data</td>
          </TableRowFade>
        </tbody>
      </table>
    );
    expect(screen.queryByText('Row Data')).not.toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });
});
