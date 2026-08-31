import { useEffect, useRef, useState } from "react";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { logService } from "../../../services/logService";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import { metricsService } from "../../../services/metricsService";

export const TRANSACTION_LOG_TYPE = "transaction";
export const SECURITY_LOG_TYPE = "security";

export function getLogTypeLabel(logType) {
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

export function useAuditLogs({ globalViewType }) {
  const { hasPermission } = usePermissionAccess();
  const canViewSecurityLogs = hasPermission(PERMISSIONS.VIEW_SECURITY_LOGS);

  const [logType, setLogType] = useState(TRANSACTION_LOG_TYPE);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sort, setSort] = useState("desc");
  const [viewType, setViewType] = useState(() => {
    return localStorage.getItem("auditLogsViewType") || globalViewType || "table";
  });

  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      if (globalViewType) {
        setViewType(globalViewType);
      }
    } else {
      isMounted.current = true;
    }
  }, [globalViewType]);

  useEffect(() => {
    localStorage.setItem("auditLogsViewType", viewType);
  }, [viewType]);

  const [logs, setLogs] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState("");
  const [logMetrics, setLogMetrics] = useState(null);

  const selectedLogTypeLabel = getLogTypeLabel(logType);
  const isSecurityLogType = logType === SECURITY_LOG_TYPE;
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  useEffect(() => {
    metricsService.getLogMetrics().then(setLogMetrics).catch(() => { });
  }, []);

  useEffect(() => {
    if (isSecurityLogType && !canViewSecurityLogs) {
      setLogType(TRANSACTION_LOG_TYPE);
      setPage(1);
    }
  }, [canViewSecurityLogs, isSecurityLogType]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const loadLogs = async () => {
      if (isSecurityLogType && !canViewSecurityLogs) {
        setLoading(false);
        setLogs([]);
        setTotalResults(0);
        setTotalPages(1);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const payload = await getLogsByType(logType, {
          page,
          limit,
          sortBy,
          order: sort,
          actor: search,
          signal: controller.signal,
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
        if (ignore || fetchError?.name === "CanceledError") {
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
      controller.abort();
    };
  }, [
    canViewSecurityLogs,
    isSecurityLogType,
    logType,
    page,
    limit,
    sortBy,
    sort,
    search,
    selectedLogTypeLabel,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleViewLog = async (log) => {
    if (isSecurityLogType && !canViewSecurityLogs) {
      return;
    }

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

    if (nextLogType === SECURITY_LOG_TYPE && !canViewSecurityLogs) {
      return;
    }

    closeMetadataModal();
    setLogType(nextLogType);
    setPage(1);
  };

  const setSearchKeyword = (val) => {
    setSearch(val);
    setPage(1);
  };

  return {
    logType,
    canViewSecurityLogs,
    search,
    setSearchKeyword,
    page,
    setPage,
    limit,
    setLimit,
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
  };
}
