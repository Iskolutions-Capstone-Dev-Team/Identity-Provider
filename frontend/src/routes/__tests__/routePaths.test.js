import { describe, it, expect } from 'vitest';
import * as routePaths from '../routePaths';

describe('routePaths', () => {
  it('exports routes', () => {
    expect(routePaths).toBeDefined();
  });
});
