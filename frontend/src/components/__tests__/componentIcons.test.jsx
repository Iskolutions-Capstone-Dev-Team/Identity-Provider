import { describe, it, expect } from 'vitest';
import * as Icons from '../componentIcons';

describe('componentIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
