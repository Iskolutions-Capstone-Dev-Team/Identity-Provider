import { describe, it, expect } from 'vitest';
import * as useAllRoles from '../useAllRoles';

describe('useAllRoles hook', () => {
  it('exports hook', () => {
    expect(useAllRoles).toBeDefined();
  });
});
