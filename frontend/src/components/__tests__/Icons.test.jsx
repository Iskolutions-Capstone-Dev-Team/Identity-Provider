import { describe, it, expect } from 'vitest';
import * as Icons from '../Icons';

describe('Icons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
