import { describe, it, expect } from 'vitest';
import * as Icons from '../profileIcons';

describe('profileIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
