import { describe, it, expect } from 'vitest';
import FAQ_TOPICS from '../faqTopics';

describe('faqTopics', () => {
  it('exports topics including Backup & Restore', () => {
    expect(FAQ_TOPICS).toBeDefined();
    const topicIds = FAQ_TOPICS.map((t) => t.id);
    expect(topicIds).toContain('backup-restore');
    expect(topicIds).toContain('audit-logs');
    expect(topicIds).toContain('user-pool');
  });
});
