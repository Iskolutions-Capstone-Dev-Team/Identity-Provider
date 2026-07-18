import { describe, it, expect } from 'vitest';
import * as useAllAppClients from '../useAllAppClients';

describe('useAllAppClients hook', () => {
  it('exports hook', () => {
    expect(useAllAppClients).toBeDefined();
  });
});
