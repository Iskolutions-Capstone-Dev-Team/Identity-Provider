import { describe, it, expect } from 'vitest';
import { sanitizePositiveIntegerParam, buildSafePaginationParams } from '../safeQueryParams';

describe('safeQueryParams', () => {
  describe('sanitizePositiveIntegerParam', () => {
    it('returns valid number', () => {
      expect(sanitizePositiveIntegerParam(5, 1)).toBe(5);
    });

    it('parses valid string number', () => {
      expect(sanitizePositiveIntegerParam('10', 1)).toBe(10);
    });

    it('returns fallback for invalid string', () => {
      expect(sanitizePositiveIntegerParam('abc', 2)).toBe(2);
    });

    it('returns fallback for numbers below min', () => {
      expect(sanitizePositiveIntegerParam(0, 5, 1)).toBe(5);
    });

    it('caps at max', () => {
      expect(sanitizePositiveIntegerParam(50, 1, 1, 10)).toBe(10);
    });
  });

  describe('buildSafePaginationParams', () => {
    it('uses defaults when no params provided', () => {
      expect(buildSafePaginationParams()).toEqual({ page: 1, limit: 10 });
    });

    it('sanitizes provided params', () => {
      expect(buildSafePaginationParams({ page: '2', limit: 50 })).toEqual({ page: 2, limit: 50 });
    });

    it('caps limit at maxLimit (100 by default)', () => {
      expect(buildSafePaginationParams({ page: 1, limit: 500 })).toEqual({ page: 1, limit: 100 });
    });
  });
});
