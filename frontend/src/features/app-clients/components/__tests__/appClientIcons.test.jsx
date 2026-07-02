import { describe, it, expect } from 'vitest';
import * as Icons from '../appClientIcons';

describe('appClientIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
