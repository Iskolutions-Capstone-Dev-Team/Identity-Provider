import { describe, it, expect } from 'vitest';
import * as authService from '../authService';

describe('authService', () => {
  it('exports auth service', () => {
    expect(authService).toBeDefined();
  });
});
