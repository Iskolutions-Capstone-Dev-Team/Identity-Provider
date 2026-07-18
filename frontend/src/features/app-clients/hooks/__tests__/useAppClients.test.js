import { describe, it, expect } from 'vitest';
import * as useAppClients from '../useAppClients';

describe('useAppClients hook', () => {
  it('exports hook', () => {
    expect(useAppClients).toBeDefined();
  });
});
