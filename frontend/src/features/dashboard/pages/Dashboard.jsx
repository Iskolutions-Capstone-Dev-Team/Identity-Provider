import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Download } from "lucide-react";
import { createPortal } from "react-dom";
import MetricFilterCard from "../components/MetricFilterCard";
import ReportConfirmModal from "../components/ReportConfirmModal";
import SecurityAnalysisPanel from "../components/SecurityAnalysisPanel";
import TopLoginsPanel from "../components/TopLoginsPanel";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { metricsService } from "../../../services/metricsService";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertCircle } from "lucide-react";

const emptyMetrics = {
  login_stats: {
    today: { count: 0, top_clients: [] },
    this_week: { count: 0, top_clients: [] },
    this_month: { count: 0, top_clients: [] },
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
  { key: "today", label: "Today", shortLabel: "Today" },
  { key: "this_week", label: "This Week", shortLabel: "Week" },
  { key: "this_month", label: "This Month", shortLabel: "Month" },
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
    loginStats: statPeriods.map((period) => ({
      ...period,
      count: getPeriodCount(loginStats[period.key]),
      topClients: getPeriodTopClients(loginStats[period.key]),
    })),
    legacyTopClients,
    securityAnalysis: source.security_analysis || emptyMetrics.security_analysis,
  };
}

function formatAnalyzedAt(value) {
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


export default function Dashboard() {
  const { colorMode = "light" } = useOutletContext() || {};
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
  const [isReportConfirmOpen, setIsReportConfirmOpen] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
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
      setIsReportConfirmOpen(false);
      setIsDownloadingReport(false);
    }
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
      {breadcrumbsContainer && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        breadcrumbsContainer
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Authentication metrics and security intelligence.</p>
          </div>
        </div>

        <Button className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200" onClick={() => setIsReportConfirmOpen(true)}>
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="space-y-6">
        {!showLoading ? (
          <div className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {reportError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{reportError}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : null}

        <section className="w-full grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {normalizedMetrics.loginStats.map((stat) => (
            <MetricFilterCard
              key={stat.key}
              stat={stat}
              colorMode={colorMode}
              isLoading={showLoading}
            />
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TopLoginsPanel
            clients={selectedTopClients}
            periods={normalizedMetrics.loginStats}
            selectedPeriod={selectedPeriod}
            selectedPeriodKey={selectedPeriodKey}
            isRestrictedView={isRestrictedMetricsView}
            colorMode={colorMode}
            isLoading={showLoading}
            onSelectPeriod={setSelectedPeriodKey}
          />

          <SecurityAnalysisPanel
            analysis={normalizedMetrics.securityAnalysis}
            analyzedAt={analyzedAt}
            colorMode={colorMode}
            isLoading={showLoading}
          />
        </div>
      </div>

      <ReportConfirmModal
        open={isReportConfirmOpen}
        colorMode={colorMode}
        isGenerating={isDownloadingReport}
        onCancel={() => setIsReportConfirmOpen(false)}
        onConfirm={handleDownloadReport}
      />
    </div>
  );
}