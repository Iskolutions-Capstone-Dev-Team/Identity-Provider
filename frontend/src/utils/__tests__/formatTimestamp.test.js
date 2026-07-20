import { describe, it, expect } from 'vitest';
import { formatTimestamp } from '../formatTimestamp';

describe('formatTimestamp', () => {
  it('formats an ISO string correctly', () => {
    // Note: this uses local time zone, so we'll mock Date to be predictable or check the regex format
    const isoString = '2025-01-15T14:30:45Z';
    const formatted = formatTimestamp(isoString);
    
    // Check regex pattern: YYYY-MM-DD HH:mm:ss
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});
