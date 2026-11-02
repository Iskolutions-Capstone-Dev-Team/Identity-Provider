import { describe, it, expect, vi, beforeEach } from 'vitest';
import { metricsService } from '../metricsService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: { get: vi.fn() }
}));
vi.mock('../../utils/requestCache', () => ({
  getCachedRequest: vi.fn(async (key, fetcher) => fetcher())
}));

describe('metricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches dashboard metrics', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { users: 10 } });
    const res = await metricsService.getDashboardMetrics();
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/metrics');
    expect(res).toEqual({ users: 10 });
  });

  it('fetches system KPIs', async () => {
    const mockKPIs = { system_health: 'Healthy', apm: { throughput_rps: 42.5 } };
    axiosInstance.get.mockResolvedValueOnce({ data: mockKPIs });
    const res = await metricsService.getSystemKPIs();
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/kpis');
    expect(res).toEqual(mockKPIs);
  });

  it('fetches KPI threat details', async () => {
    const mockThreatDetails = { threat_level: 'HIGH', triggers: { failed_logins: 60 } };
    axiosInstance.get.mockResolvedValueOnce({ data: mockThreatDetails });
    const res = await metricsService.getKPIThreatDetails();
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/kpis/threat-details');
    expect(res).toEqual(mockThreatDetails);
  });
});
