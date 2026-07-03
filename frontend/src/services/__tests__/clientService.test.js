import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientService } from '../clientService';
import axiosInstance from '../axiosInstance';
import { clearCachedRequests } from '../../utils/requestCache';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

vi.mock('../../utils/requestCache', () => ({
  clearCachedRequests: vi.fn(),
  getCachedRequest: vi.fn(async (key, fetcher) => fetcher())
}));

describe('clientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getClients fetches client list', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        clients: [{ id: 'client-1' }],
        total: 1,
        lastPage: 1
      }
    });

    const res = await clientService.getClients();
    expect(res.items).toHaveLength(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/clients', expect.any(Object));
  });

  it('getClientById fetches client details', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { id: 'client-1' } });
    const res = await clientService.getClientById('client-1');
    expect(res.id).toBe('client-1');
  });

  it('createClient posts form data', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { id: 'client-new' } });
    const res = await clientService.createClient({ name: 'Test' });
    expect(res.id).toBe('client-new');
    expect(axiosInstance.post).toHaveBeenCalledWith('/admin/clients', expect.any(FormData), expect.any(Object));
    expect(clearCachedRequests).toHaveBeenCalled();
  });

  it('rotateClientSecret patches and normalizes secret payload', async () => {
    axiosInstance.patch.mockResolvedValueOnce({ data: { clientSecret: 'new-secret' } });
    const res = await clientService.rotateClientSecret('client-1');
    expect(res.client_secret).toBe('new-secret');
    expect(axiosInstance.patch).toHaveBeenCalledWith('/admin/clients/client-1/secret');
  });
});
