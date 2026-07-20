import { describe, it, expect } from 'vitest';
import * as Icons from '../mfaIcons';

describe('mfaIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
