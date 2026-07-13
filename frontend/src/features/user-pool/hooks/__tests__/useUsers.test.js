import { describe, it, expect } from 'vitest';
import * as useUsers from '../useUsers';

describe('useUsers hook', () => {
  it('exports hook', () => {
    expect(useUsers).toBeDefined();
  });
});
