import { describe, it, expect } from 'vitest';
import { roleOptions } from '../registerRoleOptions';

describe('registerRoleOptions', () => {
  it('exports roleOptions array', () => {
    expect(Array.isArray(roleOptions)).toBe(true);
    expect(roleOptions.length).toBeGreaterThan(0);
    expect(roleOptions[0]).toHaveProperty('id');
    expect(roleOptions[0]).toHaveProperty('label');
  });
});
