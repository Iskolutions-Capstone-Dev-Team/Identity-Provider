import { describe, it, expect } from 'vitest';
import * as authAccess from '../authAccess';

describe('authAccess utils', () => {
  it('exports utilities', () => {
    expect(authAccess).toBeDefined();
  });
});
