import { describe, it, expect } from 'vitest';
import * as Icons from '../roleIcons';

describe('roleIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
