import { describe, it, expect } from 'vitest';
import * as Icons from '../ForgotPasswordIcons';

describe('ForgotPasswordIcons', () => {
  it('exports icon components', () => {
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
  });
});
