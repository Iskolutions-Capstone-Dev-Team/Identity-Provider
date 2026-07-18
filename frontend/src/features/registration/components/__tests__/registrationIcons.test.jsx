import { describe, it, expect } from 'vitest';
import * as Icons from '../registrationIcons';

describe('registrationIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
