import LogsTable from "./LogsTable";
import AuditLogsCards from "./AuditLogsCards";

export default function AuditLogsListCard({ logs, loading, error, onView, viewType = "table", logType = "transaction", colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const detailLabel = logType === "security" ? "security log" : "transaction log";
  const emptyMessage = logType === "security" ? "No security logs found" : "No transaction logs found";

  return (
    <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
      {viewType === "table" ? (
        <LogsTable
          loading={loading}
          logs={logs}
          onView={onView}
          colorMode={colorMode}
          emptyMessage={emptyMessage}
          logTypeLabel={detailLabel}
        />
      ) : (
        <AuditLogsCards
          loading={loading}
          logs={logs}
          onView={onView}
          colorMode={colorMode}
          emptyMessage={emptyMessage}
          logTypeLabel={detailLabel}
        />
      )}
    </div>
  );
}