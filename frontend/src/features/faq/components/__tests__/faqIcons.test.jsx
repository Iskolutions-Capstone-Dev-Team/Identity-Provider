import { describe, it, expect } from 'vitest';
import * as Icons from '../faqIcons';

describe('faqIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
