import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import AuditLogsListCard from "../components/audit-logs/AuditLogsListCard";
import LogMetadataModal from "../components/audit-logs/LogMetadataModal";
import { logService } from "../services/logService";
import { formatTimestamp } from "../utils/formatTimestamp";
import { useDelayedLoading } from "../hooks/useDelayedLoading";

const ITEMS_PER_PAGE = 10;
const TRANSACTION_LOG_TYPE = "transaction";
const SECURITY_LOG_TYPE = "security";

function getLogTypeLabel(logType) {
  return logType === SECURITY_LOG_TYPE ? "Security" : "Transaction";
}

async function getLogsByType(logType, params) {
  if (logType === SECURITY_LOG_TYPE) {
    return logService.getSecurityLogs(params);
  }

  return logService.getLogs(params);
}

async function getLogByType(logType, id) {
  if (logType === SECURITY_LOG_TYPE) {
    return logService.getSecurityLogById(id);
  }

  return logService.getLogById(id);
}

function getPayloadValue(payload, keys) {
  for (const key of keys) {
    if (payload?.[key] !== undefined) {
      return payload[key];
    }
  }

  return undefined;
}

function parseMetadata(metadata) {
  if (metadata == null || metadata === "") {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return metadata;
    }
  }

  return metadata;
}

function formatLogTimestamp(timestamp) {
  if (!timestamp) {
    return "-";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return typeof timestamp === "string" ? timestamp : "-";
  }

  return formatTimestamp(date.toISOString());
}

function normalizeLogId(log) {
  const rawId = getPayloadValue(log, ["id", "ID", "log_id", "logId"]);

  if (rawId == null || rawId === "") {
    return null;
  }

  const parsedId = Number.parseInt(rawId, 10);
  return Number.isInteger(parsedId) ? parsedId : rawId;
}

function normalizeLog(log = {}, index = 0) {
  const rawTimestamp = getPayloadValue(log, [
    "created_at",
    "createdAt",
    "CreatedAt",
    "timestamp",
    "Timestamp",
  ]);
  const id = normalizeLogId(log);

  return {
    id,
    rowKey: id ?? `${rawTimestamp ?? "log"}-${index}`,
    timestamp: formatLogTimestamp(rawTimestamp),
    rawTimestamp,
    actor: getPayloadValue(log, ["actor", "Actor"]) || "System",
    target: getPayloadValue(log, ["target", "Target"]) || "-",
    status: getPayloadValue(log, ["status", "Status"]) || "-",
    action: getPayloadValue(log, ["action", "Action"]) || "-",
    metadata: parseMetadata(getPayloadValue(log, ["metadata", "Metadata"])),
  };
}

function getAuditLogs(payload) {
  const logs =
    getPayloadValue(payload, ["audit_logs", "AuditLogs", "logs", "Logs"]) ||
    payload?.data?.audit_logs ||
    payload?.data?.logs;

  return Array.isArray(logs) ? logs : [];
}

function getTotalResults(payload, fallbackCount) {
  const rawTotal = getPayloadValue(payload, [
    "total_count",
    "totalCount",
    "TotalCount",
  ]);
  const parsedTotal = Number.parseInt(rawTotal, 10);

  return Number.isInteger(parsedTotal) && parsedTotal >= 0
    ? parsedTotal
    : fallbackCount;
}

function getTotalPages(payload) {
  const rawLastPage = getPayloadValue(payload, [
    "last_page",
    "lastPage",
    "LastPage",
  ]);
  const parsedLastPage = Number.parseInt(rawLastPage, 10);

  return Number.isInteger(parsedLastPage) && parsedLastPage > 0
    ? parsedLastPage
    : 1;
}

export default function AuditLogs() {
  const { colorMode = "light" } = useOutletContext() || {};
  const [logType, setLogType] = useState(TRANSACTION_LOG_TYPE);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState("");
  const showLoading = useDelayedLoading(loading);
  const selectedLogTypeLabel = getLogTypeLabel(logType);

  useEffect(() => {
    let ignore = false;

    const loadLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const payload = await getLogsByType(logType, {
          page,
          limit: ITEMS_PER_PAGE,
          actor: search,
        });
        const nextLogs = getAuditLogs(payload).map((log, index) =>
          normalizeLog(log, index),
        );

        if (ignore) {
          return;
        }

        setLogs(nextLogs);
        setTotalResults(getTotalResults(payload, nextLogs.length));
        setTotalPages(getTotalPages(payload));
      } catch (fetchError) {
        if (ignore) {
          return;
        }

        setLogs([]);
        setTotalResults(0);
        setTotalPages(1);

        if (fetchError?.response?.status === 404) {
          setError(`${selectedLogTypeLabel} log endpoint is not available in the current backend.`);
        } else {
          setError(`Failed to load ${selectedLogTypeLabel.toLowerCase()} logs. Check the backend connection.`);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadLogs();

    return () => {
      ignore = true;
    };
  }, [logType, page, search, selectedLogTypeLabel]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleViewLog = async (log) => {
    setSelectedLog(log);
    setMetadataError("");
    setIsMetadataOpen(true);

    if (!log?.id) {
      setIsMetadataLoading(false);
      return;
    }

    try {
      setIsMetadataLoading(true);

      const payload = await getLogByType(logType, log.id);
      const detailedLog = normalizeLog(
        {
          id: log.id,
          created_at: log.rawTimestamp ?? log.timestamp,
          actor: payload?.actor ?? log.actor,
          target: payload?.target ?? log.target,
          status: payload?.status ?? log.status,
          action: payload?.action ?? log.action,
          metadata: payload?.metadata ?? log.metadata,
        },
        0,
      );

      setSelectedLog(detailedLog);
    } catch (fetchError) {
      console.error("Fetch log details error:", fetchError);
      setMetadataError("Failed to load additional metadata for this log.");
    } finally {
      setIsMetadataLoading(false);
    }
  };

  const closeMetadataModal = () => {
    setIsMetadataOpen(false);
    setIsMetadataLoading(false);
    setMetadataError("");
    setSelectedLog(null);
  };

  const handleLogTypeChange = (nextLogType) => {
    if (nextLogType === logType) {
      return;
    }

    closeMetadataModal();
    setLogType(nextLogType);
    setPage(1);
  };

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <PageHeader
          title="Audit Logs"
          description="Track transaction and security activity"
          colorMode={colorMode}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-20 w-20 sm:h-24 sm:w-24">
              <path d="M11.625 16.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z" />
              <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm6 16.5c.66 0 1.277-.19 1.797-.518l1.048 1.048a.75.75 0 0 0 1.06-1.06l-1.047-1.048A3.375 3.375 0 1 0 11.625 18Z" clipRule="evenodd" />
              <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
            </svg>
          }
          variant="hero"
        />

        <div className="relative">
          <AuditLogsListCard
            logs={logs}
            totalResults={totalResults}
            itemsPerPage={ITEMS_PER_PAGE}
            search={search}
            setSearch={setSearch}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={showLoading}
            error={error}
            onView={handleViewLog}
            logType={logType}
            onLogTypeChange={handleLogTypeChange}
            colorMode={colorMode}
          />
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