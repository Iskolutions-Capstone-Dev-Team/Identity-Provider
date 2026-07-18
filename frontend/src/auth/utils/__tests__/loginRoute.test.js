import { describe, it, expect } from 'vitest';
import * as loginRoute from '../loginRoute';

describe('loginRoute utils', () => {
  it('exports utilities', () => {
    expect(loginRoute).toBeDefined();
  });
});
