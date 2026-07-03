import { describe, it, expect } from 'vitest';
import * as webAuthn from '../webAuthn';

describe('webAuthn utils', () => {
  it('exports utilities', () => {
    expect(webAuthn).toBeDefined();
  });
});
