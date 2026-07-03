import { describe, it, expect } from 'vitest';
import * as Icons from '../DashboardIcons';

describe('DashboardIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
