import { describe, it, expect } from 'vitest';
import * as usePermissions from '../usePermissions';

describe('usePermissions hook', () => {
  it('exports hook', () => {
    expect(usePermissions).toBeDefined();
  });
});
