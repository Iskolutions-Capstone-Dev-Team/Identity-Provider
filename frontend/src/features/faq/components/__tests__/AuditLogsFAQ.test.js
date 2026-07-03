import { describe, it, expect } from 'vitest';
import * as AuditLogsFAQ from '../AuditLogsFAQ';

describe('AuditLogsFAQ', () => {
  it('exports FAQ', () => {
    expect(AuditLogsFAQ).toBeDefined();
  });
});
