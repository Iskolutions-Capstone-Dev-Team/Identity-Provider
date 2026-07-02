import { describe, it, expect } from 'vitest';
import * as authRecovery from '../authRecovery';

describe('authRecovery utils', () => {
  it('exports utilities', () => {
    expect(authRecovery).toBeDefined();
  });
});
