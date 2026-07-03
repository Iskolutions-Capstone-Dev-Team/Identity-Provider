import { describe, it, expect } from 'vitest';
import * as axiosInstance from '../axiosInstance';

describe('axiosInstance', () => {
  it('exports instance', () => {
    expect(axiosInstance).toBeDefined();
  });
});
