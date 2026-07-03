import { describe, it, expect } from 'vitest';
import * as Icons from '../authIcons';

describe('authIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
