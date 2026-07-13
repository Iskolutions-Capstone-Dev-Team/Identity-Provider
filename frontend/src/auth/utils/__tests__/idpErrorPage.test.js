import { describe, it, expect } from 'vitest';
import * as idpErrorPage from '../idpErrorPage';

describe('idpErrorPage utils', () => {
  it('exports utilities', () => {
    expect(idpErrorPage).toBeDefined();
  });
});
