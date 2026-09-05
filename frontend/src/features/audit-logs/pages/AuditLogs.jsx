import { useOutletContext } from "react-router-dom";
import AuditLogsListCard from "../components/AuditLogsListCard";
import AuditLogFilters from "../components/AuditLogFilters";
import LogMetadataModal from "../components/LogMetadataModal";
import Pagination from "../../../components/Pagination";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import MetricsCard from "../../../components/MetricsCard";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { createPortal } from "react-dom";
import { FileCheck, FileSearchCorner } from "lucide-react";
import { useAuditLogs } from "../hooks/useAuditLogs";

export default function AuditLogs() {
  const { colorMode = "light", globalViewType, setGlobalViewType } = useOutletContext() || {};

  const auditLogsState = useAuditLogs({ globalViewType, setGlobalViewType });
  const {
    logType,
    canViewSecurityLogs,
    search,
    setSearchKeyword,
    page,
    setPage,
    limit,
    sortBy,
    setSortBy,
    sort,
    setSort,
    viewType,
    setViewType,
    logs,
    totalResults,
    totalPages,
    loading,
    error,
    selectedLog,
    isMetadataOpen,
    isMetadataLoading,
    metadataError,
    logMetrics,
    breadcrumbsContainer,
    handleViewLog,
    closeMetadataModal,
    handleLogTypeChange,
  } = auditLogsState;

  const showLoading = useDelayedLoading(loading);

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-5 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        {breadcrumbsContainer && createPortal(
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Audit Log</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>,
          breadcrumbsContainer
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] rounded-xl">
              <FileSearchCorner className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
              <p className="text-muted-foreground">Track transaction and security activity</p>
            </div>
          </div>
        </div>

        <MetricsCard
          colorMode={colorMode}
          isLoading={showLoading}
          metrics={(Array.isArray(logMetrics) ? logMetrics : []).map((m) => ({
            title: m.title === "Audit Logs" ? "Transaction Logs" : m.title,
            value: m.value,
            Icon: FileCheck,
          }))}
        />

        <div className="flex flex-col gap-5">
          <AuditLogFilters
            search={search}
            setSearch={setSearchKeyword}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sort={sort}
            setSort={setSort}
            viewType={viewType}
            setViewType={setViewType}
            logType={logType}
            onLogTypeChange={handleLogTypeChange}
            canViewSecurityLogs={canViewSecurityLogs}
          />
          <AuditLogsListCard
            logs={logs}
            loading={showLoading}
            viewType={viewType}
            logType={logType}
            error={error}
            onView={handleViewLog}
            colorMode={colorMode}
          />

          {!showLoading && (
            <div className="w-full">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                itemsPerPage={limit}
                totalResults={totalResults}
                currentResultsCount={logs.length}
                variant="glass"
                colorMode={colorMode}
              />
            </div>
          )}
        </div>
      </div>

      <LogMetadataModal
        open={isMetadataOpen}
        log={selectedLog}
        logType={logType}
        loading={isMetadataLoading}
        error={metadataError}
        onClose={closeMetadataModal}
        colorMode={colorMode}
      />
    </>
  );
}