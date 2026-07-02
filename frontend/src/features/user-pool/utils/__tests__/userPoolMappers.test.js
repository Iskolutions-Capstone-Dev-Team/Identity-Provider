import { describe, it, expect } from 'vitest';
import * as userPoolMappers from '../userPoolMappers';

describe('userPoolMappers utils', () => {
  it('exports utilities', () => {
    expect(userPoolMappers).toBeDefined();
  });
});
