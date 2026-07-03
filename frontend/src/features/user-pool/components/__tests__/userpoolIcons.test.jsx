import { describe, it, expect } from 'vitest';
import * as Icons from '../userpoolIcons';

describe('userpoolIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
