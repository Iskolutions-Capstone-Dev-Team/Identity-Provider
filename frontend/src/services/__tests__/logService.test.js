import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logService } from '../logService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('logService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLogs', () => {
    it('fetches logs with default pagination params', async () => {
      axiosInstance.get.mockResolvedValue({ data: { items: [] } });
      
      const result = await logService.getLogs();
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/logs', {
        params: { page: 1, limit: 10 },
        signal: undefined
      });
      expect(result).toEqual({ items: [] });
    });

    it('fetches logs with custom params and actor', async () => {
      axiosInstance.get.mockResolvedValue({ data: { items: [] } });
      
      await logService.getLogs({ page: 2, limit: 20, actor: 'admin' });
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/logs', {
        params: { page: 2, limit: 20, actor: 'admin' },
        signal: undefined
      });
    });
  });

  describe('getLogById', () => {
    it('fetches a specific log', async () => {
      axiosInstance.get.mockResolvedValue({ data: { id: '123' } });
      
      const result = await logService.getLogById('123');
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/logs/123');
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('getSecurityLogs', () => {
    it('fetches security logs with params', async () => {
      axiosInstance.get.mockResolvedValue({ data: { items: [] } });
      
      await logService.getSecurityLogs({ page: 1, limit: 10 });
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/logs/security', {
        params: { page: 1, limit: 10 },
        signal: undefined
      });
    });
  });

  describe('getSecurityLogById', () => {
    it('fetches a specific security log', async () => {
      axiosInstance.get.mockResolvedValue({ data: { id: 'sec-123' } });
      
      const result = await logService.getSecurityLogById('sec-123');
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/logs/security/sec-123');
      expect(result).toEqual({ id: 'sec-123' });
    });
  });
});
