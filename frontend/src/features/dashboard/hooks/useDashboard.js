import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { metricsService } from "../../../services/metricsService";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { PERMISSIONS } from "../../../utils/permissionAccess";

const emptyMetrics = {
  login_stats: {
    today: { count: 0, failed_count: 0, top_clients: [] },
    this_week: { count: 0, failed_count: 0, top_clients: [] },
    this_month: { count: 0, failed_count: 0, top_clients: [] },
  },
  security_analysis: {
    threat_level: "UNKNOWN",
    confidence: 0,
    anomalies: [],
    advisory: "Security analysis is not available yet.",
    analyzed_at: "",
  },
};

const statPeriods = [
  { key: "today", label: "Today", shortLabel: "Today", type: "success" },
  { key: "this_month", label: "This Month", shortLabel: "Month", type: "success" },
  { key: "unsuccessful_logins", label: "Overall", shortLabel: "Failed", type: "failed" },
];

function getPeriodCount(periodValue) {
  if (typeof periodValue === "number") {
    return periodValue;
  }

  return Number(periodValue?.count) || 0;
}

function getPeriodTopClients(periodValue) {
  return Array.isArray(periodValue?.top_clients)
    ? periodValue.top_clients
    : [];
}

function normalizeMetrics(payload) {
  const source = payload?.login_stats ? payload : emptyMetrics;
  const loginStats = source.login_stats || {};
  const legacyTopClients = Array.isArray(source.top_clients)
    ? source.top_clients
    : [];

  return {
    loginStats: statPeriods.map((period) => {
      if (period.key === "unsuccessful_logins") {
        return {
          ...period,
          count: loginStats.today?.failed_count || 0,
          topClients: [],
        };
      }
      return {
        ...period,
        count: getPeriodCount(loginStats[period.key]),
        topClients: getPeriodTopClients(loginStats[period.key]),
      };
    }),
    legacyTopClients,
    securityAnalysis: source.security_analysis || emptyMetrics.security_analysis,
  };
}

export function formatAnalyzedAt(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatTimestamp(date.toISOString());
}

function createReportFileName() {
  const datePart = new Date().toISOString().slice(0, 10);
  return `metrics_report_${datePart}.pdf`;
}

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useDashboard() {
  const { hasPermission } = usePermissionAccess();
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  const [metrics, setMetrics] = useState(null);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");
  const [isReportTypeSelectionOpen, setIsReportTypeSelectionOpen] = useState(false);
  const [isReportConfirmOpen, setIsReportConfirmOpen] = useState(false);
  const [isSystemReportConfirmOpen, setIsSystemReportConfirmOpen] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [isLoginsModalOpen, setIsLoginsModalOpen] = useState(false);
  const [selectedModalPeriod, setSelectedModalPeriod] = useState(null);

  const showLoading = useDelayedLoading(loading);
  const normalizedMetrics = useMemo(() => normalizeMetrics(metrics), [metrics]);

  const selectedPeriod = normalizedMetrics.loginStats.find(
    (stat) => stat.key === selectedPeriodKey,
  ) || normalizedMetrics.loginStats[0];

  const selectedTopClients = selectedPeriod.topClients.length > 0
    ? selectedPeriod.topClients
    : normalizedMetrics.legacyTopClients;

  const analyzedAt = formatAnalyzedAt(
    normalizedMetrics.securityAnalysis.analyzed_at,
  );

  const isRestrictedMetricsView = !hasPermission(PERMISSIONS.VIEW_ALL_APPCLIENTS);

  const handleCardClick = (stat) => {
    if (stat.type === "success") {
      setSelectedModalPeriod(stat);
      setIsLoginsModalOpen(true);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError("");

        const payload = await metricsService.getDashboardMetrics();

        if (!ignore) {
          setMetrics(payload);
        }
      } catch (fetchError) {
        console.error("Dashboard metrics error:", fetchError);

        if (!ignore) {
          setMetrics(null);
          setError("Dashboard metrics are unavailable. Please check the backend connection.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadMetrics();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDownloadReport = async (filters) => {
    try {
      setIsDownloadingReport(true);
      setReportError("");

      const reportBlob = await metricsService.downloadReport(filters);
      downloadBlob(reportBlob, createReportFileName());
    } catch (downloadError) {
      console.error("Metrics report download error:", downloadError);
      setReportError("Unable to generate the metrics report right now.");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleDownloadSystemReport = async (filters) => {
    try {
      setIsDownloadingReport(true);
      setReportError("");

      const reportBlob = await metricsService.downloadSystemReport(filters);
      const datePart = new Date().toISOString().slice(0, 10);
      downloadBlob(reportBlob, `system_report_${datePart}.pdf`);
    } catch (downloadError) {
      console.error("System report download error:", downloadError);
      setReportError("Unable to generate the system report right now.");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleSelectReportType = (type) => {
    if (type === 'authentication') {
      setIsReportConfirmOpen(true);
    } else if (type === 'system') {
      setIsSystemReportConfirmOpen(true);
    }
  };

  const handleReportConfirmCancel = () => {
    setIsReportConfirmOpen(false);
  };

  const handleReportConfirm = async (filters) => {
    toast.success("Authentication Report generated");
    await handleDownloadReport(filters);
    setIsReportConfirmOpen(false);
    setIsReportTypeSelectionOpen(false);
  };

  const handleSystemReportConfirmCancel = () => {
    setIsSystemReportConfirmOpen(false);
  };

  const handleSystemReportConfirm = async (filters) => {
    toast.success("System Report generated");
    await handleDownloadSystemReport(filters);
    setIsSystemReportConfirmOpen(false);
    setIsReportTypeSelectionOpen(false);
  };

  return {
    breadcrumbsContainer,
    error,
    reportError,
    showLoading,
    normalizedMetrics,
    selectedPeriodKey,
    setSelectedPeriodKey,
    selectedPeriod,
    selectedTopClients,
    analyzedAt,
    isRestrictedMetricsView,
    isReportTypeSelectionOpen,
    setIsReportTypeSelectionOpen,
    isReportConfirmOpen,
    isSystemReportConfirmOpen,
    isDownloadingReport,
    isLoginsModalOpen,
    setIsLoginsModalOpen,
    selectedModalPeriod,
    handleCardClick,
    handleSelectReportType,
    handleReportConfirmCancel,
    handleReportConfirm,
    handleSystemReportConfirmCancel,
    handleSystemReportConfirm,
  };
}
