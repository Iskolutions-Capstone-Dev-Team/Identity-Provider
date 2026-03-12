import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import AuditLogsListCard from "../components/audit-logs/AuditLogsListCard";
import LogMetadataModal from "../components/audit-logs/LogMetadataModal";
import { logService } from "../services/logService";
import { formatTimestamp } from "../utils/formatTimestamp";

const ITEMS_PER_PAGE = 10;

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const payload = await logService.getLogs({
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
          setError("Audit log endpoint is not available in the current backend.");
        } else {
          setError("Failed to load audit logs. Check the backend connection.");
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
  }, [page, search]);

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

      const payload = await logService.getLogById(log.id);
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

  return (
    <>
      <div className="flex flex-col items-center gap-6 px-3 sm:px-6">
        <PageHeader
          title="Audit Logs"
          description="Track user actions and transaction history"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-28 w-28 text-[#991b1b]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
        />

        <AuditLogsListCard
          logs={logs}
          totalResults={totalResults}
          itemsPerPage={ITEMS_PER_PAGE}
          search={search}
          setSearch={setSearch}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
          error={error}
          onView={handleViewLog}
        />
      </div>

      <LogMetadataModal
        open={isMetadataOpen}
        log={selectedLog}
        loading={isMetadataLoading}
        error={metadataError}
        onClose={closeMetadataModal}
      />
    </>
  );
}
