import { describe, it, expect } from 'vitest';
import * as Icons from '../auditLogIcons';

describe('auditLogIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
