import TableRowFade from "../TableRowFade";

const headerCellClassName =
  "border-b border-white/10 px-6 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90";

function getStatusClasses(status, isDarkMode) {
  const normalizedStatus =
    typeof status === "string" ? status.trim().toLowerCase() : "";

  if (normalizedStatus === "success") {
    return isDarkMode
      ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : "border border-emerald-200/80 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "fail" || normalizedStatus === "failed") {
    return isDarkMode
      ? "border border-red-400/30 bg-red-400/10 text-red-200"
      : "border border-red-200/80 bg-red-50 text-red-700";
  }

  return isDarkMode
    ? "border border-[#f8d24e]/20 bg-[#f8d24e]/10 text-[#ffe28a]"
    : "border border-[#7b0d15]/10 bg-[#fff7ef] text-[#7b0d15]";
}

function getRowClassName(index, isDarkMode) {
  if (isDarkMode) {
    return `transition-colors duration-500 ease-out ${
      index % 2 === 0
        ? "bg-white/[0.03] hover:bg-[#f8d24e]/[0.08]"
        : "bg-[#7b0d15]/[0.08] hover:bg-[#7b0d15]/[0.16]"
    }`;
  }

  return `transition-colors duration-300 ${
    index % 2 === 0
      ? "bg-white/70 hover:bg-[#fff4dc]/70"
      : "bg-[#fff8f3]/80 hover:bg-[#fff4dc]/80"
  }`;
}

export default function TransactionLogsTable({ logs, onView, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const wrapperClassName = isDarkMode
    ? "overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(28,18,29,0.92))] shadow-[0_22px_55px_-38px_rgba(2,6,23,0.82)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/65 shadow-[0_22px_55px_-38px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const tableHeaderRowClassName = isDarkMode
    ? "bg-[linear-gradient(135deg,#7b0d15_0%,#253247_55%,#421117_100%)]"
    : "bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)]";
  const bodyCellClassName = isDarkMode
    ? "border-b border-white/10 px-6 py-5 text-center align-middle text-sm text-[#f1e5e7]"
    : "border-b border-[#7b0d15]/10 px-6 py-5 text-center align-middle text-sm text-[#5d3a41]";
  const timestampCellClassName = isDarkMode
    ? `${bodyCellClassName} text-[0.82rem] text-[#f8d996]`
    : `${bodyCellClassName} text-[0.82rem] text-[#7b0d15]`;
  const actorCellClassName = isDarkMode
    ? `${bodyCellClassName} whitespace-nowrap font-semibold text-[#f6eaec]`
    : `${bodyCellClassName} whitespace-nowrap font-semibold text-[#4a1921]`;
  const actionCellClassName = isDarkMode
    ? `${bodyCellClassName} max-w-44 break-words text-[#f7dadd]`
    : `${bodyCellClassName} max-w-44 break-words text-[#7b0d15]`;
  const emptyStateClassName = isDarkMode
    ? "px-6 py-16 text-center text-sm text-[#bda8af]"
    : "px-6 py-16 text-center text-sm text-[#8f6f76]";
  const actionButtonClassName = isDarkMode
    ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-[#f1e5e7] shadow-[0_14px_30px_-24px_rgba(2,6,23,0.72)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/60 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.84))] text-[#7b0d15] shadow-[0_14px_30px_-24px_rgba(43,3,7,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";

  return (
    <div className={wrapperClassName}>
      <div className="overflow-x-auto">
        <table className="table w-full min-w-[72rem] lg:min-w-0">
          <thead>
            <tr className={tableHeaderRowClassName}>
              <th className={headerCellClassName}>Timestamp</th>
              <th className={headerCellClassName}>Actor</th>
              <th className={headerCellClassName}>Target</th>
              <th className={headerCellClassName}>Status</th>
              <th className={headerCellClassName}>Action</th>
              <th className={headerCellClassName}>View</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className={emptyStateClassName}>
                  No transaction logs found
                </td>
              </tr>
            )}

            {logs.map((log, index) => (
              <TableRowFade
                key={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`}
                keyId={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`}
                className={getRowClassName(index, isDarkMode)}
              >
                <td className={timestampCellClassName}>
                  {log.timestamp}
                </td>
                <td className={actorCellClassName} title={log.actor}>
                  {log.actor}
                </td>
                <td className={`${bodyCellClassName} max-w-56 break-words`}>
                  {log.target}
                </td>
                <td className={bodyCellClassName}>
                  <span className={`inline-flex min-w-[6rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.06em] ${getStatusClasses(log.status, isDarkMode)}`}>
                    {log.status}
                  </span>
                </td>
                <td className={actionCellClassName}>
                  {log.action}
                </td>
                <td className={bodyCellClassName}>
                  <button type="button" aria-label={`View ${log.actor} log details`} className={actionButtonClassName} onClick={() => onView(log)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                  </button>
                </td>
              </TableRowFade>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}