import { describe, it, expect } from 'vitest';
import * as routePermissions from '../routePermissions';

describe('routePermissions', () => {
  it('exports permissions', () => {
    expect(routePermissions).toBeDefined();
  });
});
