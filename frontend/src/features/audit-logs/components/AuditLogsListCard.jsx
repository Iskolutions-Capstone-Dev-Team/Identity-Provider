import LogsTable from "./LogsTable";
import AuditLogsCards from "./AuditLogsCards";

export default function AuditLogsListCard({ logs, loading, error, onView, logType = "transaction", colorMode = "light" }) {
  const detailLabel = logType === "security" ? "security log" : "transaction log";
  const emptyMessage = logType === "security" ? "No security logs found" : "No transaction logs found";

  return (
    <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Laptop & Desktop Table (>= 1024px) */}
      <div className="hidden lg:block w-full">
        <LogsTable
          loading={loading}
          logs={logs}
          onView={onView}
          colorMode={colorMode}
          emptyMessage={emptyMessage}
          logTypeLabel={detailLabel}
        />
      </div>

      {/* Mobile & Tablet Cards (< 1024px) */}
      <div className="block lg:hidden w-full">
        <AuditLogsCards
          loading={loading}
          logs={logs}
          onView={onView}
          colorMode={colorMode}
          emptyMessage={emptyMessage}
          logTypeLabel={detailLabel}
        />
      </div>
    </div>
  );
}
