import axiosInstance from "./axiosInstance";
import { metricsService } from "./metricsService";

export const reportService = {
  getAnalyticsReport: (params) => metricsService.getAnalyticsReport(params),
  exportReportCSV: (params) => metricsService.exportReportCSV(params),
  downloadSystemReport: (filters) => metricsService.downloadSystemReport(filters),
  downloadSummaryReport: (filters) => metricsService.downloadSummaryReport(filters),
  downloadReport: (filters) => metricsService.downloadReport(filters),
};
