import { describe, it, expect, vi, beforeEach } from 'vitest';
import { permissionService } from '../permissionService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

// Mock requestCache to bypass caching for tests
vi.mock('../../utils/requestCache', () => ({
  getCachedRequest: vi.fn((key, factory) => factory())
}));

describe('permissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPermissions', () => {
    it('fetches all permissions successfully', async () => {
      const mockData = ['admin', 'user'];
      axiosInstance.get.mockResolvedValue({ data: mockData });
      
      const result = await permissionService.getPermissions();
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/permissions/all', { skipForbiddenAlert: true });
      expect(result).toEqual(mockData);
    });

    it('returns empty array if response data is invalid', async () => {
      axiosInstance.get.mockResolvedValue({ data: null });
      
      const result = await permissionService.getPermissions();
      expect(result).toEqual([]);
    });
  });

  describe('getCurrentUserPermissions', () => {
    it('fetches current user permissions successfully', async () => {
      const mockData = { permissions: ['read', 'write'] };
      axiosInstance.get.mockResolvedValue({ data: mockData });
      
      const result = await permissionService.getCurrentUserPermissions();
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/permissions', { skipForbiddenAlert: true });
      expect(result).toEqual(['read', 'write']);
    });
  });
});
