import { describe, it, expect } from 'vitest';
import { shortenId } from '../shortenId';

describe('shortenId', () => {
  it('returns empty string if id is falsy', () => {
    expect(shortenId('')).toBe('');
    expect(shortenId(null)).toBe('');
  });

  it('shortens string to length and appends ..', () => {
    expect(shortenId('1234567890')).toBe('12345678..');
  });

  it('accepts custom length', () => {
    expect(shortenId('1234567890', 4)).toBe('1234..');
  });
});
