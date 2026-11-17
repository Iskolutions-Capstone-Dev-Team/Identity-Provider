import { describe, it, expect } from 'vitest';
import BackupRestoreFAQ from '../BackupRestoreFAQ';

describe('BackupRestoreFAQ', () => {
  it('exports valid BackupRestore FAQ configuration', () => {
    expect(BackupRestoreFAQ).toBeDefined();
    expect(BackupRestoreFAQ.id).toBe('backup-restore');
    expect(BackupRestoreFAQ.title).toBe('Backup & Restore');
    expect(BackupRestoreFAQ.questions.length).toBeGreaterThan(0);
  });

  it('contains expected questions covering key backup and restore operations', () => {
    const questionIds = BackupRestoreFAQ.questions.map((q) => q.id);
    expect(questionIds).toContain('backup-restore-purpose');
    expect(questionIds).toContain('create-backup');
    expect(questionIds).toContain('restore-backup');
    expect(questionIds).toContain('log-retention-policy');
    expect(questionIds).toContain('log-retention-schedule');
    expect(questionIds).toContain('backup-permissions');
  });

  it('has non-empty non-technical answers for each question', () => {
    BackupRestoreFAQ.questions.forEach((q) => {
      expect(q.question).toBeTruthy();
      expect(Array.isArray(q.answer)).toBe(true);
      expect(q.answer.length).toBeGreaterThan(0);
      q.answer.forEach((paragraph) => {
        expect(typeof paragraph).toBe('string');
        expect(paragraph.length).toBeGreaterThan(0);
      });
    });
  });
});
