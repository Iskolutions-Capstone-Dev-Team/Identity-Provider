import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Download } from "lucide-react";
import { createPortal } from "react-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import MetricFilterCard from "../components/MetricFilterCard";
import ReportConfirmModal from "../components/ReportConfirmModal";
import SystemReportConfirmModal from "../components/SystemReportConfirmModal";
import ReportTypeSelectionModal from "../components/ReportTypeSelectionModal";
import SecurityAnalysisPanel from "../components/SecurityAnalysisPanel";
import TopLoginsPanel from "../components/TopLoginsPanel";
import SystemLoginsModal from "../components/SystemLoginsModal";
import SystemHealthWidget from "../components/SystemHealthWidget";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";

export default function Dashboard() {
  const { colorMode = "light" } = useOutletContext() || {};
  const dashboardState = useDashboard();

  const {
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
  } = dashboardState;

  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    onSelect();
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-4 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
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
          <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] rounded-xl">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Authentication metrics and security intelligence.</p>
          </div>
        </div>

        <Button className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200" onClick={() => setIsReportTypeSelectionOpen(true)}>
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

        <section className="hidden sm:grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
          {normalizedMetrics.loginStats.map((stat) => (
            <MetricFilterCard
              key={stat.key}
              stat={stat}
              colorMode={colorMode}
              isLoading={showLoading}
              onClick={() => handleCardClick(stat)}
              isClickable={stat.type === "success"}
            />
          ))}
        </section>

        <section className="block sm:hidden w-full">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {normalizedMetrics.loginStats.map((stat) => (
                <CarouselItem key={stat.key}>
                  <MetricFilterCard
                    stat={stat}
                    colorMode={colorMode}
                    isLoading={showLoading}
                    onClick={() => handleCardClick(stat)}
                    isClickable={stat.type === "success"}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 py-3 mt-1">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2 cursor-pointer rounded-full transition-all duration-500 ease-in-out",
                    index === current
                      ? "bg-primary w-4 opacity-100"
                      : "bg-muted-foreground w-2 opacity-30 hover:opacity-50"
                  )}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </section>

        <div className="grid gap-6">
          <SystemHealthWidget colorMode={colorMode} isDashboardLoading={showLoading} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TopLoginsPanel
            clients={selectedTopClients}
            periods={normalizedMetrics.loginStats.filter((p) => p.type !== "failed")}
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

      <ReportTypeSelectionModal
        open={isReportTypeSelectionOpen}
        onClose={() => setIsReportTypeSelectionOpen(false)}
        onSelectType={handleSelectReportType}
      />

      <ReportConfirmModal
        open={isReportConfirmOpen}
        colorMode={colorMode}
        isGenerating={isDownloadingReport}
        onCancel={handleReportConfirmCancel}
        onConfirm={handleReportConfirm}
      />

      <SystemReportConfirmModal
        open={isSystemReportConfirmOpen}
        colorMode={colorMode}
        isGenerating={isDownloadingReport}
        onCancel={handleSystemReportConfirmCancel}
        onConfirm={handleSystemReportConfirm}
      />

      <SystemLoginsModal
        open={isLoginsModalOpen}
        onClose={() => setIsLoginsModalOpen(false)}
        period={selectedModalPeriod}
        colorMode={colorMode}
      />
    </div>
  );
}