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

  it('fetches 1-year analytics report', async () => {
    const mockReport = {
      from: '2025-11-15',
      to: '2026-11-15',
      interval: 'month',
      summary: { total_events: 500 },
      timeseries: [],
    };
    axiosInstance.get.mockResolvedValueOnce({ data: mockReport });
    const res = await metricsService.getAnalyticsReport({
      from: '2025-11-15',
      to: '2026-11-15',
      interval: 'month',
      type: 'all',
    });
    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/admin/reports?from=2025-11-15&to=2026-11-15&interval=month&type=all',
      { signal: undefined }
    );
    expect(res).toEqual(mockReport);
  });

  it('exports report CSV as blob', async () => {
    const mockBlob = new Blob(['col1,col2\nval1,val2'], { type: 'text/csv' });
    axiosInstance.get.mockResolvedValueOnce({ data: mockBlob });
    const res = await metricsService.exportReportCSV({
      from: '2026-01-01',
      to: '2026-02-01',
      type: 'audit',
    });
    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/admin/reports/export?from=2026-01-01&to=2026-02-01&type=audit',
      { responseType: 'blob', signal: undefined }
    );
    expect(res).toEqual(mockBlob);
  });
});
