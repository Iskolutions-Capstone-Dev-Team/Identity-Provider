import { describe, it, expect } from 'vitest';
import * as userPoolFilters from '../userPoolFilters';

describe('userPoolFilters utils', () => {
  it('exports utilities', () => {
    expect(userPoolFilters).toBeDefined();
  });
});
