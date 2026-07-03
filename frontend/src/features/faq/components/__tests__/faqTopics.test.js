import { describe, it, expect } from 'vitest';
import * as faqTopics from '../faqTopics';

describe('faqTopics', () => {
  it('exports topics', () => {
    expect(faqTopics).toBeDefined();
  });
});
