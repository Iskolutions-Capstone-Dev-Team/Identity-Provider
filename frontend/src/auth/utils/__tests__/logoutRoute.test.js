import { describe, it, expect } from 'vitest';
import * as logoutRoute from '../logoutRoute';

describe('logoutRoute utils', () => {
  it('exports utilities', () => {
    expect(logoutRoute).toBeDefined();
  });
});
