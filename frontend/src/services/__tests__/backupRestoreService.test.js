import { describe, it, expect, vi, beforeEach } from 'vitest';
import { backupRestoreService } from '../backupRestoreService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('backupRestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches latest backup info', async () => {
    const mockData = { timestamp: '2026-11-15T00:00:00Z', type: 'automated', size: '1.2 MB' };
    axiosInstance.get.mockResolvedValueOnce({ data: mockData });

    const result = await backupRestoreService.getLatestBackup();
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/backup/latest', { signal: undefined });
    expect(result).toEqual(mockData);
  });

  it('runs database backup', async () => {
    const mockData = { message: 'Backup created successfully', path: 'backup.sql.gz' };
    axiosInstance.post.mockResolvedValueOnce({ data: mockData });

    const result = await backupRestoreService.runBackup();
    expect(axiosInstance.post).toHaveBeenCalledWith('/admin/backup/run');
    expect(result).toEqual(mockData);
  });

  it('triggers log retention run', async () => {
    const mockResponse = {
      status: 'completed',
      cutoff_date: '2025-10-15',
      audit_logs_archived: 150,
      audit_logs_purged: 150,
      security_logs_archived: 45,
      security_logs_purged: 45,
      archive_files: ['log-archives/audit/2025/10/audit_logs.csv.gz'],
      duration: '120ms',
    };
    axiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await backupRestoreService.triggerRetentionRun();
    expect(axiosInstance.post).toHaveBeenCalledWith('/admin/logs/retention/run');
    expect(result).toEqual(mockResponse);
  });
});
