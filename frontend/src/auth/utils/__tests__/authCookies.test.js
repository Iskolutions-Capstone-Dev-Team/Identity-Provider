import { describe, it, expect } from 'vitest';
import * as authCookies from '../authCookies';

describe('authCookies utils', () => {
  it('exports utilities', () => {
    expect(authCookies).toBeDefined();
  });
});
